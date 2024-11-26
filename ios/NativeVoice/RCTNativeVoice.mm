//
//  RCTNativeVoice.m
//  DigiYatra
//
//  Created by Althaf on 26/11/2024.
//

// iOS Swift Module Implementation

import Foundation
import Speech
import React
import NativeVoiceSpec

@objc(NativeVoiceModule)
class NativeVoiceModule: NativeVoiceSpec, RCTEventEmitter, RCTBridgeModule {
    private var speechRecognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()

    override init() {
        super.init()
        speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    }

    static func moduleName() -> String! {
        return "NativeVoice"
    }

    @objc func startSpeech(_ locale: String, opts: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        requestAuthorization { [weak self] granted in
            guard granted else {
                reject("PERMISSION_DENIED", "Audio recording permission is required", nil)
                return
            }
            
            self?.startListening(resolve: resolve, reject: reject)
        }
    }

    @objc func stopSpeech() {
        audioEngine.stop()
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
    }

    @objc func cancelSpeech() {
        stopSpeech()
    }

    @objc func destroySpeech(_ resolve: @escaping RCTPromiseResolveBlock) {
        stopSpeech()
        resolve(nil)
    }

    @objc func isSpeechAvailable(_ resolve: @escaping RCTPromiseResolveBlock) {
        resolve(SFSpeechRecognizer.authorizationStatus() == .authorized)
    }

    @objc func getSpeechRecognitionServices(_ resolve: @escaping RCTPromiseResolveBlock) {
        resolve(["SFSpeechRecognizer"])
    }

    @objc func isRecognizing(_ resolve: @escaping RCTPromiseResolveBlock) {
        resolve(audioEngine.isRunning)
    }

    private func requestAuthorization(completion: @escaping (Bool) -> Void) {
        SFSpeechRecognizer.requestAuthorization { status in
            DispatchQueue.main.async {
                completion(status == .authorized)
            }
        }
    }

    private func startListening(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        if audioEngine.isRunning {
            reject("ALREADY_RUNNING", "Recognition is already running", nil)
            return
        }
        
        do {
            recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
            guard let recognitionRequest = recognitionRequest else {
                reject("INIT_FAILED", "Failed to initialize recognition request", nil)
                return
            }
            
            recognitionRequest.shouldReportPartialResults = true
            let inputNode = audioEngine.inputNode
            let recordingFormat = inputNode.outputFormat(forBus: 0)
            inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { (buffer, _) in
                recognitionRequest.append(buffer)
            }
            
            audioEngine.prepare()
            try audioEngine.start()
            
            recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest) { [weak self] result, error in
                if let error = error {
                    self?.sendEvent(withName: "onSpeechError", body: ["error": error.localizedDescription])
                    return
                }
                
                if let result = result {
                    let isFinal = result.isFinal
                    let recognizedText = result.bestTranscription.formattedString
                    self?.sendEvent(withName: isFinal ? "onSpeechResults" : "onSpeechPartialResults", body: ["recognizedText": recognizedText])
                    
                    if isFinal {
                        self?.stopSpeech()
                        resolve("Listening complete")
                    }
                }
            }
            resolve("Listening started")
        } catch {
            reject("ERROR_START_LISTENING", "Error starting audio session", error)
        }
    }

    override func supportedEvents() -> [String]! {
        return ["onSpeechReady", "onSpeechBegin", "onSpeechRmsChanged", "onSpeechEnd", "onSpeechError", "onSpeechResults", "onSpeechPartialResults"]
    }
}
