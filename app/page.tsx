"use client";

import { useState } from "react";
import LandingScreen from "./components/LandingScreen";
import PinScreen from "./components/PinScreen";
import TrustCheck from "./components/TrustCheck";
import QuizScreen from "./components/QuizScreen";
import AlbumIntro from "./components/AlbumIntro";
import AlbumReveal from "./components/AlbumReveal";
import PhotoAlbum from "./components/PhotoAlbum";
import RewardReveal from "./components/RewardReveal";
import WishInput from "./components/WishInput";
import SongContinues from "./components/SongContinues";
import LetterPages from "./components/LetterPages";
import MusicProvider from "./components/MusicProvider";

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [trustChecked, setTrustChecked] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [albumRevealed, setAlbumRevealed] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [albumDone, setAlbumDone] = useState(false);
  const [rewardDone, setRewardDone] = useState(false);
  const [wishDone, setWishDone] = useState(false);
  const [songMessageDone, setSongMessageDone] = useState(false);

  if (!entered) {
    return <LandingScreen onEnter={() => setEntered(true)} />;
  }

  if (!unlocked) {
    return <PinScreen onUnlock={() => setUnlocked(true)} />;
  }

  if (!trustChecked) {
    return <TrustCheck onContinue={() => setTrustChecked(true)} />;
  }

  if (!quizDone) {
    return <QuizScreen onComplete={() => setQuizDone(true)} />;
  }

  if (!introDone) {
    return <AlbumIntro onContinue={() => setIntroDone(true)} />;
  }

  if (!albumRevealed) {
    return <AlbumReveal onContinue={() => setAlbumRevealed(true)} />;
  }

  // MusicProvider wraps every step from here on (not just the album) and
  // stays mounted across all of them — the song starts playing once she
  // reaches the album and keeps going through reward/wish/song-continues/
  // letters without restarting, since none of those steps unmount it.
  return (
    <MusicProvider>
      {!albumDone && <PhotoAlbum onContinue={() => setAlbumDone(true)} />}
      {albumDone && !rewardDone && (
        <RewardReveal onContinue={() => setRewardDone(true)} />
      )}
      {albumDone && rewardDone && !wishDone && (
        <WishInput onContinue={() => setWishDone(true)} />
      )}
      {albumDone && rewardDone && wishDone && !songMessageDone && (
        <SongContinues onContinue={() => setSongMessageDone(true)} />
      )}
      {albumDone && rewardDone && wishDone && songMessageDone && <LetterPages />}
    </MusicProvider>
  );
}
