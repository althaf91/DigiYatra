package nativevoice;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.turbomodule.core.interfaces.TurboModule;
import com.nativevoice.NativeVoiceSpec;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.speech.RecognitionListener;
import android.speech.RecognitionService;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import javax.annotation.Nullable;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class NativeVoiceModule extends NativeVoiceSpec implements TurboModule {

    private SpeechRecognizer speechRecognizer;
    private final ReactApplicationContext reactContext;
    private Intent recognizerIntent;
    private String recognizedText;
    private final Handler mainHandler;
    public NativeVoiceModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        mainHandler = new Handler(Looper.getMainLooper());
    }

    @NonNull
    @Override
    public String getName() {
        return "NativeVoice";
    }

    private String getLocale(String locale) {
        if (locale != null && !locale.isEmpty()) {
            return locale;
        }

        return Locale.getDefault().toString();
    }
    private void initializeSpeechRecognizer() {
            if (SpeechRecognizer.isRecognitionAvailable(reactContext)) {
                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactContext);
                speechRecognizer.setRecognitionListener(new CustomRecognitionListener());
                recognizerIntent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                recognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                recognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault().toString());
                recognizerIntent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
            } else {
                Toast.makeText(reactContext, "Please enable Google Voice Assistance in your phone settings.", Toast.LENGTH_LONG).show();
                promptUserToEnableSpeechRecognition();            }
    }

    private void downloadGoogleSpeechRecognition() {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(android.net.Uri.parse("market://details?id=com.google.android.googlequicksearchbox"));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
        } catch (ActivityNotFoundException e) {
            Log.e("NativeVoice", "Google Speech Recognition app not found.");
        }
    }

    private void promptUserToEnableSpeechRecognition() {
        try {
            Intent intent = new Intent(Settings.ACTION_VOICE_INPUT_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
        } catch (ActivityNotFoundException e) {
            Log.e("NativeVoice", "Speech recognition settings not found.");
        }
    }

    @Override
    public void startSpeech(String locale, ReadableMap opts, Promise promise) {
        mainHandler.post(() -> {
            try {
                if (speechRecognizer != null) {
                    speechRecognizer.startListening(recognizerIntent);
                    promise.resolve("Listening started");
                } else {
                    initializeSpeechRecognizer();
                }
            } catch (Exception e) {
                promise.reject("ERROR_START_LISTENING", e);
            }
        });    }

    @Override
    public void stopSpeech() {
        mainHandler.post(() -> {
            try {
                if (speechRecognizer != null) {
                    speechRecognizer.stopListening();
                }
            } catch (Exception e) {
                Log.e("NativeVoice", "Error stopping listening", e);
            }
        });
    }

    @Override
    public void cancelSpeech() {
        if (speechRecognizer != null) {
            speechRecognizer.cancel();
        }
    }

    @Override
    public void destroySpeech(Promise promise) {
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
            speechRecognizer = null;
        }
        promise.resolve(null);
    }

    @Override
    public void isSpeechAvailable(Promise promise) {
        boolean isAvailable = SpeechRecognizer.isRecognitionAvailable(reactContext);
        promise.resolve(isAvailable);
    }

    @Override
    public void getSpeechRecognitionServices(Promise promise) {
        List<ResolveInfo> services = reactContext.getPackageManager().queryIntentServices(new Intent(RecognitionService.SERVICE_INTERFACE), 0);
        WritableArray serviceList = Arguments.createArray();
        for (ResolveInfo service : services) {
            serviceList.pushString(service.serviceInfo.packageName);
        }
        promise.resolve(serviceList);
    }

    @Override
    public void isRecognizing(Promise promise) {
        boolean isRecognizing = (speechRecognizer != null);
        promise.resolve(isRecognizing);
    }

    @Override
    public void addListener(String eventType) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @Override
    public void removeListeners(double count) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    private void sendEvent(String eventName, @Nullable WritableMap params) {
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    private class CustomRecognitionListener implements RecognitionListener {
        @Override
        public void onReadyForSpeech(Bundle params) {
            WritableMap map = Arguments.createMap();
            map.putString("status", "ready");
            sendEvent("onSpeechReady", map);
        }

        @Override
        public void onBeginningOfSpeech() {
            WritableMap map = Arguments.createMap();
            map.putString("status", "beginning");
            sendEvent("onSpeechBegin", map);
        }

        @Override
        public void onRmsChanged(float rmsdB) {
            WritableMap map = Arguments.createMap();
            map.putDouble("rmsdB", rmsdB);
            sendEvent("onSpeechRmsChanged", map);
        }

        @Override
        public void onBufferReceived(byte[] buffer) {}

        @Override
        public void onEndOfSpeech() {
            WritableMap map = Arguments.createMap();
            map.putString("status", "end");
            sendEvent("onSpeechEnd", map);
        }

        @Override
        public void onError(int error) {
            WritableMap map = Arguments.createMap();
            map.putInt("error", error);
            sendEvent("onSpeechError", map);
        }

        @Override
        public void onResults(Bundle results) {
            ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
            if (matches != null && !matches.isEmpty()) {
                recognizedText = matches.get(0);
                WritableMap map = Arguments.createMap();
                map.putString("recognizedText", recognizedText);
                sendEvent("onSpeechResults", map);
            }
        }

        @Override
        public void onPartialResults(Bundle partialResults) {
            ArrayList<String> matches = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
            if (matches != null && !matches.isEmpty()) {
                WritableMap map = Arguments.createMap();
                map.putString("partialText", matches.get(0));
                sendEvent("onSpeechPartialResults", map);
            }
        }

        @Override
        public void onEvent(int eventType, Bundle params) {}
    }
}
