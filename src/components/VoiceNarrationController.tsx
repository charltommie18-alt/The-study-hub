import React, { useState, useEffect, useMemo } from 'react';
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
  Download,
  ShieldCheck,
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
  downloadSpeechAudio,
  SpeechPlaybackState,
  SUPPORTED_LANGUAGES,
  loadVoiceSettings,
  validateLanguageCode,
} from '../utils/multilingualSpeech';

export const VoiceNarrationController: React.FC = () => {
  const [speechState, setSpeechState] =
    useState<SpeechPlaybackState>(
      getSpeechState(),
    );

  const [isMinimized, setIsMinimized] =
    useState(false);

  const [showAdvancedSettings, setShowAdvancedSettings] =
    useState(false);

  const [isMuted, setIsMuted] =
    useState(false);

  const [isDownloading, setIsDownloading] =
    useState(false);

  /*
   * Always normalize the language.
   *
   * Afrikaans:
   * af-ZA
   *
   * English:
   * en-US
   *
   * Spanish:
   * es-ES
   */
  const validatedLanguage = useMemo(() => {
    return validateLanguageCode(
      speechState.langCode || 'af-ZA',
    );
  }, [speechState.langCode]);

  /*
   * Subscribe to the central speech engine.
   */
  useEffect(() => {
    const unsubscribe =
      subscribeSpeechState((state) => {
        setSpeechState(state);
      });

    return () => {
      unsubscribe();
    };
  }, []);

  /*
   * Do not display the controller when nothing
   * is currently being played.
   */
  if (
    !speechState.isPlaying &&
    !speechState.isPaused
  ) {
    return null;
  }

  const langObj =
    SUPPORTED_LANGUAGES.find(
      (language) =>
        language.code === validatedLanguage,
    ) || {
      code: 'af-ZA',
      name: 'Afrikaans',
      nativeName: 'Afrikaans',
      flag: '🇿🇦',
    };

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

  const handleDownloadAudio = async () => {
    if (
      !speechState.currentText ||
      isDownloading
    ) {
      return;
    }

    setIsDownloading(true);

    try {
      await downloadSpeechAudio(
        speechState.currentText,
        validatedLanguage,
        'studyhub_audio',
      );
    } catch (error) {
      console.error(
        'Unable to download speech audio:',
        error,
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const currentSettings =
    loadVoiceSettings();

  const currentGender =
    currentSettings.voiceGender || 'male';

  /*
   * When Afrikaans is selected, the actual Azure
   * voices are:
   *
   * Male:
   * af-ZA-WillemNeural
   *
   * Female:
   * af-ZA-AdriNeural
   *
   * The UI does not expose random browser voices.
   */
  const activeAfrikaansVoice =
    currentGender === 'male'
      ? 'af-ZA-WillemNeural'
      : 'af-ZA-AdriNeural';

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
          p-3
          sm:p-4
          shadow-2xl
          flex
          flex-col
          gap-2.5
        "
      >

        {/* TOP INFORMATION BAR */}

        <div
          className="
            flex
            items-center
            justify-between
            text-xs
            border-b
            border-white/10
            pb-2
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
            <span className="text-base">
              {langObj.flag}
            </span>

            <div
              className="
                flex
                items-center
                gap-1.5
                font-bold
                truncate
              "
            >
              <span
                className="
                  text-emerald-400
                  text-[11px]
                  uppercase
                  tracking-wider
                "
              >
                {currentGender === 'male'
                  ? '👨 Manlike KI-Stem'
                  : '👩 Vroulike KI-Stem'}
              </span>

              <span className="text-white/40">
                •
              </span>

              <span
                className="
                  text-white/90
                  text-xs
                  truncate
                "
              >
                {langObj.name}
              </span>
            </div>

            {validatedLanguage ===
              'af-ZA' && (
              <span
                className="
                  hidden
                  sm:inline-flex
                  items-center
                  gap-1
                  px-1.5
                  py-0.5
                  bg-emerald-500/20
                  text-emerald-300
                  text-[9px]
                  font-bold
                  rounded-md
                  border
                  border-emerald-500/30
                "
                title="South African Afrikaans is active"
              >
                <ShieldCheck
                  className="
                    w-2.5
                    h-2.5
                    text-emerald-400
                  "
                />

                <span>
                  af-ZA
                </span>
              </span>
            )}

            {speechState.isPlaying &&
              !speechState.isPaused && (
                <span
                  className="
                    flex
                    items-center
                    gap-1
                    px-2
                    py-0.5
                    bg-emerald-500/20
                    text-emerald-300
                    text-[10px]
                    font-bold
                    rounded-full
                    animate-pulse
                  "
                >
                  <span
                    className="
                      w-1.5
                      h-1.5
                      rounded-full
                      bg-emerald-400
                    "
                  />

                  Praat
                </span>
              )}

            {speechState.isPaused && (
              <span
                className="
                  px-2
                  py-0.5
                  bg-amber-500/20
                  text-amber-300
                  text-[10px]
                  font-bold
                  rounded-full
                "
              >
                Gepouseer
              </span>
            )}
          </div>

          <div
            className="
              flex
              items-center
              gap-1
            "
          >
            {/* DOWNLOAD */}

            <button
              onClick={handleDownloadAudio}
              disabled={
                isDownloading ||
                !speechState.currentText
              }
              className="
                p-1.5
                rounded-lg
                text-white/70
                hover:text-emerald-300
                hover:bg-white/10
                transition-colors
                cursor-pointer
              "
              title="Laai Oudio Af"
            >
              <Download
                className={`
                  w-3.5
                  h-3.5
                  ${
                    isDownloading
                      ? 'animate-bounce text-emerald-400'
                      : ''
                  }
                `}
              />
            </button>

            {/* ADVANCED SETTINGS */}

            <button
              onClick={() =>
                setShowAdvancedSettings(
                  !showAdvancedSettings,
                )
              }
              className={`
                p-1.5
                rounded-lg
                transition-colors
                cursor-pointer
                ${
                  showAdvancedSettings
                    ? 'bg-emerald-500/30 text-emerald-300'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }
              `}
              title="Stem- en klankinstellings"
            >
              <Sliders
                className="w-3.5 h-3.5"
              />
            </button>

            {/* MINIMIZE */}

            <button
              onClick={() =>
                setIsMinimized(
                  !isMinimized,
                )
              }
              className="
                p-1
                hover:bg-white/10
                rounded-lg
                text-white/70
                hover:text-white
                transition-colors
                cursor-pointer
                text-[11px]
              "
              title={
                isMinimized
                  ? 'Wys Teks'
                  : 'Versteek Teks'
              }
            >
              {isMinimized
                ? 'Wys'
                : 'Versteek'}
            </button>

            {/* STOP */}

            <button
              onClick={stopSpeech}
              className="
                p-1
                hover:bg-white/10
                rounded-lg
                text-white/70
                hover:text-white
                transition-colors
                cursor-pointer
              "
              title="Stop Oudio"
            >
              <X
                className="w-4 h-4"
              />
            </button>
          </div>
        </div>

        {/* VOICE SELECTION */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-1.5
            py-0.5
          "
        >
          <div
            className="
              flex
              items-center
              gap-1.5
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
                shrink-0
              "
            >
              {/* MALE */}

              <button
                onClick={() =>
                  setVoiceGender('male')
                }
                className={`
                  px-2.5
                  py-1
                  rounded-lg
                  text-xs
                  font-bold
                  flex
                  items-center
                  gap-1
                  transition-all
                  cursor-pointer
                  ${
                    currentGender === 'male'
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'text-white/80 hover:text-white'
                  }
                `}
                title="
                  Afrikaanse manlike
                  Azure-stem
                "
              >
                <span>
                  👨 Manlik
                </span>
              </button>

              {/* FEMALE */}

              <button
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
                  flex
                  items-center
                  gap-1
                  transition-all
                  cursor-pointer
                  ${
                    currentGender ===
                    'female'
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'text-white/80 hover:text-white'
                  }
                `}
                title="
                  Afrikaanse vroulike
                  Azure-stem
                "
              >
                <span>
                  👩 Vroulik
                </span>
              </button>
            </div>
          </div>

          {/* CURRENT AZURE VOICE */}

          <div
            className="
              flex
              items-center
              gap-1
              text-[10px]
              text-emerald-300
              font-semibold
              truncate
            "
            title={activeAfrikaansVoice}
          >
            <span>
              🇿🇦
            </span>

            <span className="truncate">
              {validatedLanguage ===
              'af-ZA'
                ? currentGender === 'male'
                  ? 'Willem'
                  : 'Adri'
                : currentGender === 'male'
                  ? 'Manlike'
                  : 'Vroulike'}
            </span>
          </div>
        </div>

        {/* ADVANCED SETTINGS */}

        {showAdvancedSettings && (
          <div
            className="
              bg-black/30
              border
              border-white/10
              rounded-xl
              p-2.5
              text-xs
              grid
              grid-cols-1
              gap-3
              animate-fade-in
            "
          >
            {/* VOICE INFORMATION */}

            <div
              className="
                bg-white/5
                rounded-lg
                p-2
              "
            >
              <span
                className="
                  text-white/60
                  text-[10px]
                  uppercase
                  font-bold
                  block
                  mb-1
                "
              >
                Aktiewe KI-stem:
              </span>

              <span
                className="
                  text-emerald-300
                  text-xs
                  font-semibold
                "
              >
                {activeAfrikaansVoice}
              </span>
            </div>

            {/* VOLUME */}

            <div>
              <span
                className="
                  text-white/60
                  text-[10px]
                  uppercase
                  font-bold
                  block
                  mb-1
                "
              >
                Klankvolume:
              </span>

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <button
                  onClick={
                    handleToggleMute
                  }
                  className="
                    p-1
                    bg-white/10
                    hover:bg-white/20
                    rounded-lg
                    text-white/80
                    cursor-pointer
                  "
                  title="Demp klank"
                >
                  {speechState.volume ===
                    0 ||
                  isMuted ? (
                    <VolumeX
                      className="
                        w-3.5
                        h-3.5
                        text-red-400
                      "
                    />
                  ) : (
                    <Volume2
                      className="
                        w-3.5
                        h-3.5
                        text-emerald-400
                      "
                    />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={
                    speechState.volume
                  }
                  onChange={(event) => {
                    const value =
                      parseFloat(
                        event.target
                          .value,
                      );

                    setSpeechVolume(
                      value,
                    );

                    setIsMuted(
                      value === 0,
                    );
                  }}
                  className="
                    w-full
                    accent-emerald-400
                    cursor-pointer
                    h-1.5
                    bg-white/20
                    rounded-lg
                  "
                />

                <span
                  className="
                    text-[10px]
                    font-mono
                    text-emerald-300
                    w-8
                    text-right
                  "
                >
                  {Math.round(
                    speechState.volume *
                      100,
                  )}
                  %
                </span>
              </div>
            </div>
          </div>
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
            pt-0.5
          "
        >
          {/* WAVEFORM */}

          <div
            className="
              flex
              items-center
              gap-1.5
              px-2
              py-1
              bg-white/5
              rounded-xl
            "
          >
            <Volume2
              className="
                w-4
                h-4
                text-emerald-400
                shrink-0
              "
            />

            <div
              className="
                flex
                items-end
                gap-0.5
                h-4
                w-10
                sm:w-14
              "
            >
              <span
                className={`
                  w-1
                  bg-emerald-400
                  rounded-full
                  transition-all
                  ${
                    speechState.isPlaying &&
                    !speechState.isPaused
                      ? 'h-3.5 animate-bounce'
                      : 'h-1.5'
                  }
                `}
              />

              <span
                className={`
                `
  w-1
  bg-emerald-300
  rounded-full
  transition-all
  ${
    speechState.isPlaying &&
    !speechState.isPaused
      ? 'h-3 animate-pulse'
      : 'h-1.5'
  }
`
}
/>

<span
  className={`
    w-1
    bg-emerald-400
    rounded-full
    transition-all
    ${
      speechState.isPlaying &&
      !speechState.isPaused
        ? 'h-2 animate-bounce'
        : 'h-2'
    }
  `}
 />

<span
  className={`
    w-1
    bg-emerald-300
    rounded-full
    transition-all
    ${
      speechState.isPlaying &&
      !speechState.isPaused
        ? 'h-3 animate-pulse'
        : 'h-1.5'
    }
  `}
 />
</div>
</div>

{/* CENTER CONTROLS */}

<div
  className="
    flex
    items-center
    gap-2
  "
>
  {/* RESTART */}

  <button
    onClick={restartSpeech}
    className="
      p-2
      bg-white/10
      hover:bg-white/20
      text-white
      rounded-xl
      transition-all
      cursor-pointer
    "
    title="Herbegin Oudio"
  >
    <RotateCcw
      className="
        w-3.5
        h-3.5
      "
    />
  </button>

  {/* PAUSE / RESUME */}

  <button
    onClick={togglePauseSpeech}
    className={`
      flex
      items-center
      gap-1.5
      px-4
      py-2
      rounded-xl
      font-bold
      text-xs
      shadow-md
      transition-all
      cursor-pointer
      active:scale-95
      ${
        speechState.isPaused
          ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
          : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
      }
    `}
    title={
      speechState.isPaused
        ? 'Gaan Voort'
        : 'Pouseer'
    }
  >
    {speechState.isPaused ? (
      <>
        <Play
          className="
            w-4
            h-4
            fill-current
          "
        />

        <span>
          Voortgaan
        </span>
      </>
    ) : (
      <>
        <Pause
          className="
            w-4
            h-4
            fill-current
          "
        />

        <span>
          Pouseer
        </span>
      </>
    )}
  </button>

  {/* STOP */}

  <button
    onClick={stopSpeech}
    className="
      p-2
      bg-white/10
      hover:bg-red-500/30
      text-white
      hover:text-red-300
      rounded-xl
      transition-all
      cursor-pointer
    "
    title="Stop Oudio"
  >
    <Square
      className="
        w-4
        h-4
        fill-current
      "
    />
  </button>
</div>

{/* SPEED */}

<button
  onClick={handleCycleSpeed}
  className="
    flex
    items-center
    gap-1
    px-2.5
    py-1.5
    bg-white/10
    hover:bg-white/20
    text-white
    rounded-xl
    text-xs
    font-bold
    transition-all
    cursor-pointer
    shrink-0
  "
  title="Verander Speelspoed"
>
  <FastForward
    className="
      w-3.5
      h-3.5
      text-emerald-400
    "
  />

  <span>
    {speechState.playbackRate}x
  </span>
</button>

</div>
</div>
</aside>
);
};

export default VoiceNarrationController;
