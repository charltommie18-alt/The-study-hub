import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  FastForward,
  RotateCcw,
  Sliders,
  X,
} from 'lucide-react';

import {
  getSpeechState,
  subscribeSpeechState,
  togglePauseSpeech,
  stopSpeech,
  restartSpeech,
  setSpeechRate,
  setSpeechVolume,
  setVoiceGender,
  SpeechPlaybackState,
  SUPPORTED_LANGUAGES,
  loadVoiceSettings,
  validateLanguageCode,
  getAvailableSystemVoices,
  subscribeVoicesList,
  FormattedVoiceOption,
} from '../utils/multilingualSpeech';

export const VoiceNarrationController: React.FC =
  () => {
    const [speechState, setSpeechState] =
      useState<SpeechPlaybackState>(
        getSpeechState(),
      );

    const [isMinimized, setIsMinimized] =
      useState(false);

    const [
      showAdvancedSettings,
      setShowAdvancedSettings,
    ] = useState(false);

    const [isMuted, setIsMuted] =
      useState(false);

    const [systemVoices, setSystemVoices] =
      useState<FormattedVoiceOption[]>(
        () => getAvailableSystemVoices(),
      );

    useEffect(() => {
      const unsubscribe =
        subscribeSpeechState(
          (state) => {
            setSpeechState(state);
          },
        );

      return () => {
        unsubscribe();
      };
    }, []);

    useEffect(() => {
      const unsubscribe =
        subscribeVoicesList(
          (voices) => {
            setSystemVoices(voices);
          },
        );

      return () => {
        unsubscribe();
      };
    }, []);

    const validatedLanguage =
      useMemo(() => {
        return validateLanguageCode(
          speechState.langCode ||
            'af-ZA',
        );
      }, [speechState.langCode]);

    const langObj =
      SUPPORTED_LANGUAGES.find(
        (language) =>
          language.code ===
          validatedLanguage,
      ) || {
        code: 'af-ZA',
        name: 'Afrikaans',
        nativeName: 'Afrikaans',
        flag: '🇿🇦',
      };

    const currentSettings =
      loadVoiceSettings();

    const currentGender =
      currentSettings.voiceGender ||
      'male';

    const activeDeviceVoice =
      systemVoices.find(
        (voice) =>
          voice.voiceURI ===
          speechState.selectedVoiceURI,
      );

    const isAfrikaans =
      validatedLanguage ===
      'af-ZA';

    const speedOptions = [
      0.75,
      1.0,
      1.25,
      1.5,
      2.0,
    ];

    const handleCycleSpeed = () => {
      const currentIndex =
        speedOptions.indexOf(
          speechState.playbackRate,
        );

      const nextIndex =
        currentIndex === -1
          ? 1
          : (currentIndex + 1) %
            speedOptions.length;

      setSpeechRate(
        speedOptions[nextIndex],
      );
    };

    const handleToggleMute = () => {
      if (isMuted) {
        setSpeechVolume(1);
        setIsMuted(false);
      } else {
        setSpeechVolume(0);
        setIsMuted(true);
      }
    };

    const handleRestart = () => {
      void restartSpeech();
    };

    // The controller remains hidden until speech starts.
    if (
      !speechState.isPlaying &&
      !speechState.isPaused
    ) {
      return null;
    }

    return (
      <aside
        aria-label="Audio narration controls"
        className="
          fixed
          bottom-20
          sm:bottom-6
          left-1/2
          -translate-x-1/2
          z-50
          w-[96%]
          max-w-xl
          animate-slide-up
        "
      >
        <div
          className="
            bg-[#2D362E]/95
            dark:bg-[#121A14]/95
            backdrop-blur-md
            border
            border-[#5A6D5B]/40
            dark:border-emerald-600/40
            text-white
            rounded-2xl
            shadow-2xl
            p-3
            space-y-3
          "
        >
          {/* TOP BAR */}
          <div
            className="
              flex
              items-center
              justify-between
              gap-2
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                min-w-0
              "
            >
              <span className="text-lg">
                {langObj.flag}
              </span>

              <div className="min-w-0">
                <div
                  className="
                    text-xs
                    font-bold
                    text-white
                  "
                >
                  {langObj.name}
                </div>

                <div
                  className="
                    text-[10px]
                    text-white/60
                    truncate
                  "
                >
                  {isAfrikaans
                    ? activeDeviceVoice?.name ||
                      speechState
                        .detectedAfrikaansVoiceName ||
                      'Afrikaanse toestelstem'
                    : activeDeviceVoice?.name ||
                      'Toestelstem'}
                </div>
              </div>
            </div>

            <div
              className="
                flex
                items-center
                gap-1
              "
            >
              <button
                type="button"
                onClick={() =>
                  setIsMinimized(
                    !isMinimized,
                  )
                }
                className="
                  p-1.5
                  hover:bg-white/10
                  rounded-lg
                  text-white/70
                  hover:text-white
                  transition-colors
                "
                title={
                  isMinimized
                    ? 'Wys'
                    : 'Versteek'
                }
              >
                {isMinimized ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Sliders className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={stopSpeech}
                className="
                  p-1.5
                  hover:bg-white/10
                  rounded-lg
                  text-white/70
                  hover:text-white
                  transition-colors
                "
                title="Stop Oudio"
                aria-label="Stop Oudio"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* VOICE SELECTION */}
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-2
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <span
                    className="
                      text-[11px]
                      font-bold
                      text-white/70
                    "
                  >
                    Kies Stem:
                  </span>

                  <div
                    className="
                      flex
                      items-center
                      gap-1
                      bg-white/10
                      p-0.5
                      rounded-xl
                    "
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setVoiceGender(
                          'male',
                        )
                      }
                      className={`
                        px-2.5
                        py-1
                        rounded-lg
                        text-xs
                        font-bold
                        transition-all
                        ${
                          currentGender ===
                          'male'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'text-white/80 hover:text-white'
                        }
                      `}
                      title={
                        isAfrikaans
                          ? 'Afrikaanse manlike toestelstem'
                          : 'Manlike toestelstem'
                      }
                    >
                      👨 Manlik
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setVoiceGender(
                          'female',
                        )
                      }
                      className={`
                        px-2.5
                        py-1
                        rounded-lg
                        text-xs
                        font-bold
                        transition-all
                        ${
                          currentGender ===
                          'female'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'text-white/80 hover:text-white'
                        }
                      `}
                      title={
                        isAfrikaans
                          ? 'Afrikaanse vroulike toestelstem'
                          : 'Vroulike toestelstem'
                      }
                    >
                      👩 Vroulik
                    </button>
                  </div>
                </div>

                <div
                  className="
                    text-[10px]
                    text-emerald-300
                    font-semibold
                    truncate
                    max-w-[45%]
                  "
                  title={
                    activeDeviceVoice?.name ||
                    'Device TTS'
                  }
                >
                  <span className="mr-1">
                    📱
                  </span>

                  <span>
                    {activeDeviceVoice?.name ||
                      (isAfrikaans
                        ? 'Afrikaanse toestelstem'
                        : 'Toestelstem')}
                  </span>
                </div>
              </div>

              {/* VOICE STATUS */}
              <div
                className="
                  rounded-xl
                  bg-white/5
                  border
                  border-white/5
                  p-2
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-2
                  "
                >
                  <span
                    className="
                      text-[10px]
                      uppercase
                      font-bold
                      text-white/50
                    "
                  >
                    Stembron
                  </span>

                  <span
                    className="
                      text-[10px]
                      font-semibold
                      text-emerald-300
                    "
                  >
                    Toestel TTS
                  </span>
                </div>

                <div
                  className="
                    mt-1
                    text-[10px]
                    text-white/60
                  "
                >
                  {isAfrikaans
                    ? 'Afrikaans word direk aan die toestel se af-ZA TTS-stem gestuur.'
                    : `${langObj.name} word deur die toestel se TTS-stem gelees.`}
                </div>
              </div>
            </>
          )}

          {/* SPOKEN TEXT */}
          {!isMinimized &&
            speechState.currentText && (
              <p
                className="
                  text-xs
                  text-white/80
                  line-clamp-2
                  leading-relaxed
                  italic
                  bg-white/5
                  rounded-xl
                  p-2
                  border
                  border-white/5
                "
              >
                "{speechState.currentText}"
              </p>
            )}

          {/* AUDIO CONTROLS */}
          <div
            className="
              flex
              items-center
              justify-between
              gap-2
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              {/* PLAY / PAUSE */}
              <button
                type="button"
                onClick={
                  togglePauseSpeech
                }
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-emerald-500
                  text-slate-950
                  flex
                  items-center
                  justify-center
                  hover:bg-emerald-400
                  transition-colors
                "
                title={
                  speechState.isPaused
                    ? 'Speel voort'
                    : 'Pauseer'
                }
                aria-label={
                  speechState.isPaused
                    ? 'Speel voort'
                    : 'Pauseer'
                }
              >
                {speechState.isPaused ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </button>

              {/* STOP */}
              <button
                type="button"
                onClick={stopSpeech}
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-white/10
                  text-white
                  flex
                  items-center
                  justify-center
                  hover:bg-white/20
                  transition-colors
                "
                title="Stop"
                aria-label="Stop"
              >
                <Square className="w-4 h-4" />
              </button>

              {/* RESTART */}
              <button
                type="button"
                onClick={handleRestart}
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-white/10
                  text-white
                  flex
                  items-center
                  justify-center
                  hover:bg-white/20
                  transition-colors
                "
                title="Begin weer"
                aria-label="Begin weer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* SPEED */}
              <button
                type="button"
                onClick={
                  handleCycleSpeed
                }
                className="
                  h-9
                  px-2.5
                  rounded-xl
                  bg-white/10
                  text-white
                  flex
                  items-center
                  gap-1
                  hover:bg-white/20
                  transition-colors
                "
                title="Verander spoed"
                aria-label="Verander spoed"
              >
                <FastForward className="w-3.5 h-3.5" />

                <span className="text-[10px] font-bold">
                  {speechState.playbackRate.toFixed(
                    2,
                  )}
                  x
                </span>
              </button>
            </div>

            {/* VOLUME */}
            <button
              type="button"
              onClick={
                handleToggleMute
              }
              className="
                w-9
                h-9
                rounded-xl
                bg-white/10
                text-white
                flex
                items-center
                justify-center
                hover:bg-white/20
                transition-colors
              "
              title={
                isMuted
                  ? 'Sit klank aan'
                  : 'Demp klank'
              }
              aria-label={
                isMuted
                  ? 'Sit klank aan'
                  : 'Demp klank'
              }
            >
              {isMuted ||
              speechState.volume ===
                0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </aside>
    );
  };

export default VoiceNarrationController;
/*
 * This section intentionally remains part of the same
 * VoiceNarrationController.tsx file.
 *
 * No Azure code.
 * No pitch controls.
 * No external voice API.
 *
 * The component above contains the complete controller.
 * Nothing else needs to be added below this comment.
 */
