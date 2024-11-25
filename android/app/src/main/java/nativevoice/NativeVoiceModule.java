package nativevoice;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.nativevoice.NativeVoiceSpec;
import android.Manifest;
import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognitionService;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.util.Log;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.modules.core.PermissionAwareActivity;
import com.facebook.react.modules.core.PermissionListener;
import javax.annotation.Nullable;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class NativeVoiceModule extends NativeVoiceSpec {

    private final ReactApplicationContext reactContext;
    private SpeechRecognizer speechRecognizer;
    private boolean isRecognizing = false;
    private String locale = null;
    private long lastExecutionTime = 0;

    public NativeVoiceModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
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

    @Override
    public void startSpeech(String locale, ReadableMap opts, Promise promise) {
        startSpeechWithPermissions(locale, opts, promise);
    }

    // Start listening for speech
    private void startListening(ReadableMap opts) {
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
            speechRecognizer = null;
        }
        Log.i("Speech Recognizer","Enter startListening");

        Handler mainHandler = new Handler(Looper.getMainLooper());

        mainHandler.post(new Runnable() {
            @Override
            public void run() {
                // Setup speech recognizer based on engine
                String recognizerEngine = opts.hasKey("RECOGNIZER_ENGINE") ? opts.getString("RECOGNIZER_ENGINE") : null;
                if ("GOOGLE".equals(recognizerEngine)) {
                    Log.i("SpeechRecognizer","enter google speech init");

                    speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactContext,
                            ComponentName.unflattenFromString("com.google.android.googlequicksearchbox/com.google.android.voicesearch.serviceapi.GoogleRecognitionService"));
                } else {
                    Log.i("SpeechRecognizer","enter speech init");
                    speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactContext);
                }

                speechRecognizer.setRecognitionListener(new RecognitionListener() {
                    @Override
                    public void onReadyForSpeech(Bundle bundle) {
                        WritableMap event = Arguments.createMap();
                        event.putBoolean("error", false);
                        sendEvent("onSpeechStart", event);
                        Log.d("SpeechRecognizer", "onReadyForSpeech()");
                    }

                    @Override
                    public void onBeginningOfSpeech() {
                        Log.d("SpeechRecognizer", "onBeginningForSpeech()");
                        sendEvent("onSpeechStart", Arguments.createMap());
                    }

                    @Override
                    public void onRmsChanged(float rmsdB) {
                        Log.d("SpeechRecognizer", "onRmsChanged()");
                        // throttle to one request every 100 ms
                        long currentTime = System.currentTimeMillis();
                        long elapsedTime = currentTime - NativeVoiceModule.this.lastExecutionTime;
                        if (elapsedTime < 200) {
                            return;
                        } else {
                            NativeVoiceModule.this.lastExecutionTime = currentTime;
                        }

                        WritableMap event = Arguments.createMap();
                        event.putDouble("value", (double) rmsdB);
                        sendEvent("onSpeechVolumeChanged", event);
                    }

                    @Override
                    public void onBufferReceived(byte[] bytes) {
                        WritableMap event = Arguments.createMap();
                        event.putBoolean("error", false);
                        sendEvent("onSpeechRecognized", event);
                        Log.d("SpeechRecognizer", "onBufferReceived()");
                    }

                    @Override
                    public void onEndOfSpeech() {
                        WritableMap event = Arguments.createMap();
                        event.putBoolean("error", false);
                        sendEvent("onSpeechEnd", event);
                        Log.d("SpeechRecognizer", "onEndOfSpeech()");
                        isRecognizing = false;
                    }

                    @Override
                    public void onError(int errorCode) {
                        String errorMessage = String.format("%d/%s", errorCode, getErrorText(errorCode));
                        WritableMap error = Arguments.createMap();
                        error.putString("message", errorMessage);
                        error.putString("code", String.valueOf(errorCode));
                        WritableMap event = Arguments.createMap();
                        event.putMap("error", error);
                        sendEvent("onSpeechError", event);
                        Log.d("SpeechRecognizer", "onError() - " + errorMessage);
                    }

                    @Override
                    public void onResults(Bundle results) {
                        Log.i("Speech Recognizer","Enter results");
                        WritableArray resultArray = Arguments.createArray();
                        ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                        if (matches != null) {
                            for (String match : matches) {
                                Log.i("Speech Recognizer",match);

                                resultArray.pushString(match);
                            }
                        }
                        WritableMap event = Arguments.createMap();
                        event.putArray("value", resultArray);
                        sendEvent("onSpeechResults", event);
                        Log.d("SpeechRecognizer", "onEndOfResult()");

                    }

                    @Override
                    public void onPartialResults(Bundle results) {
                        WritableArray arr = Arguments.createArray();

                        ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                        if (matches != null) {
                            for (String result : matches) {
                                arr.pushString(result);
                            }
                        }

                        WritableMap event = Arguments.createMap();
                        event.putArray("value", arr);
                        sendEvent("onSpeechPartialResults", event);
                        Log.d("SpeechRecognizer", "onPartialResults()");
                    }

                    @Override
                    public void onEvent(int i, Bundle bundle) {

                    }
                });

                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                // Add options from JS
                ReadableMapKeySetIterator iterator = opts.keySetIterator();
                while (iterator.hasNextKey()) {
                    String key = iterator.nextKey();
                    switch (key) {
                        case "EXTRA_LANGUAGE_MODEL":
                            // Handle language model selection
                            break;
                        case "EXTRA_MAX_RESULTS":
                            intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, opts.getInt(key));
                            break;
                        // Add more cases as needed for other options
                    }
                }

                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault().toString());
                speechRecognizer.startListening(intent);
            }
        });
    }

    private void startSpeechWithPermissions(final String locale, final ReadableMap opts, final Promise promise) {
        this.locale = locale;

        Log.i("Speech Recognizer","Enter with permission");
        if (!isPermissionGranted()) {
            String[] permissions = {Manifest.permission.RECORD_AUDIO};
            if (getCurrentActivity() != null) {
                ((PermissionAwareActivity) getCurrentActivity()).requestPermissions(permissions, 1, new PermissionListener() {
                    @Override
                    public boolean onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
                        boolean granted = true;
                        for (int result : grantResults) {
                            if (result != PackageManager.PERMISSION_GRANTED) {
                                granted = false;
                                break;
                            }
                        }
                        if (granted) {
                            startListening(opts);
                            promise.resolve(null);
                        } else {
                            promise.reject("PERMISSION_DENIED", "Audio recording permission not granted");
                        }
                        return true;
                    }
                });
            }
            return;
        }

        Log.i("Speech Recognizer","before enter start listening");

        startListening(opts);
        promise.resolve(null);
    }

    // Check if the app has required permissions
    private boolean isPermissionGranted() {
        return getReactApplicationContext().checkCallingOrSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
    }


    @Override
    public void stopSpeech() {
        if (speechRecognizer != null) {
            speechRecognizer.stopListening();
        }
        isRecognizing = false;
    }

    @Override
    public void cancelSpeech() {
        if (speechRecognizer != null) {
            speechRecognizer.cancel();
        }
        isRecognizing = false;
    }

    @Override
    public void destroySpeech(Promise promise) {
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
        }
        speechRecognizer = null;
        isRecognizing = false;
        promise.resolve(null);
    }

    @Override
    public void isSpeechAvailable(Promise promise) {
        boolean isAvailable = SpeechRecognizer.isRecognitionAvailable(reactContext);
        promise.resolve(isAvailable);
    }

    @Override
    public void getSpeechRecognitionServices(Promise promise) {
        List<ResolveInfo> services = reactContext.getPackageManager()
                .queryIntentServices(new Intent(RecognitionService.SERVICE_INTERFACE), 0);
        WritableArray serviceNames = Arguments.createArray();
        for (ResolveInfo service : services) {
            serviceNames.pushString(service.serviceInfo.packageName);
        }
        promise.resolve(serviceNames);

    }

    @Override
    public void isRecognizing(Promise promise) {
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
        this.reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    private static String getErrorText(int errorCode) {
        return switch (errorCode) {
            case SpeechRecognizer.ERROR_AUDIO -> "Audio recording error";
            case SpeechRecognizer.ERROR_CLIENT -> "Client side error";
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Insufficient permissions";
            case SpeechRecognizer.ERROR_NETWORK -> "Network error";
            case SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout";
            case SpeechRecognizer.ERROR_NO_MATCH -> "No match";
            case SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "RecognitionService busy";
            case SpeechRecognizer.ERROR_SERVER -> "error from server";
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech input";
            default -> "Didn't understand, please try again.";
        };
    }

}
