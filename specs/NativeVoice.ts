import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  startSpeech(locale: string, opts: Object): Promise<string>;
  stopSpeech(): void;
  cancelSpeech(): void;
  destroySpeech(): Promise<string>;
  isSpeechAvailable(): Promise<boolean>;
  getSpeechRecognitionServices(): Promise<Array<string>>;
  isRecognizing(): Promise<boolean>;

  // Event emitter-related methods
  addListener(eventType: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeVoice') as Spec;
