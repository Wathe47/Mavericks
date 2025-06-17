
import discordBlack from "../assets/socials/discord.svg";
import twitter from "../assets/socials/twitter.svg";
import instagram from "../assets/socials/instagram.svg";
import telegram from "../assets/socials/telegram.svg";
import facebook from "../assets/socials/facebook.svg";
import speech from "../assets/speech.jpeg"
import clinical from "../assets/clinical.jpeg";
import cognitive from "../assets/cognitive.webp";
import eeg from "../assets/eeg.webp";

export const navigation = [
   {
      id: "0",
      title: "Modules",
      url: "/#modules",
   },
   {
      id: "1",
      title: "Features",
      url: "#features",
   },
   {
      id: "2",
      title: "About Us",
      url: "/",
   },
   {
      id: "3",
      title: "Contact Us",
      url: "/",
   },
   {
      id: "4",
      title: "New account",
      url: "/",
      onlyMobile: true,
   },
   {
      id: "5",
      title: "Sign in",
      url: "/",
      onlyMobile: true,
   },
];


export const mavericksServices = [
   "Photo generating",
   "Photo enhance",
   "Seamless Integration",
];


export const features = [
   {
      id: "0",
      title: "Speech Assessment",
      text: "Enable users to record their voice for assessments, providing a more personalized and interactive experience.",
      date: "May 2023",
      status: "done",
      imageUrl: speech,
   },
   {
      id: "1",
      title: "Clinical Assessment",
      text: "Implement a comprehensive view of the user's medical history, including past diagnoses, treatments, and medications.",
      date: "May 2023",
      status: "progress",
      imageUrl: clinical,
   },
   {
      id: "2",
      title: "EEG Assessment",
      text: "Integrate EEG assessment capabilities to analyze brain activity and provide insights into mental health.",
      date: "May 2023",
      status: "done",
      imageUrl: eeg,
   },
   {
      id: "3",
      title: "Cognitive Assessment",
      text: "Add cognitive assessment History features to evaluate memory, attention, and other cognitive functions.",
      date: "May 2023",
      status: "progress",
      imageUrl: cognitive,
   },
];

export const collabText =
   "With smart automation and top-notch security, it's the perfect solution for consultants looking to work smarter.";

export const collabContent = [
   {
      id: "0",
      title: "Seamless Diagnosis",
      text: collabText,
   },
   {
      id: "1",
      title: "Smart Automation",
   },
   {
      id: "2",
      title: "Top-notch Security",
   },
];


export const modules = [
   {
      id: "0",
      title: "Dementia Module",
      text: "The app uses advanced algorithms to analyze user data and provide accurate diagnoses.",
      backgroundUrl: "./src/assets/moduleCards/card-1.svg",
      videoUrl: "./src/assets/animations/video3.mp4",
      light: true,
      pageUrl: "/dementia-module",

   },
   {
      id: "1",
      title: "Depression Module",
      text: "The app uses advanced algorithms to analyze user data and provide accurate diagnoses.",
      backgroundUrl: "./src/assets/moduleCards/card-2.svg",
      videoUrl: "./src/assets/animations/video4.mp4",
      light: true,
      pageUrl: "/depression-module",

   },
   {
      id: "2",
      title: "Anxiety Module",
      text: "The app uses advanced algorithms to analyze user data and provide accurate diagnoses.",
      backgroundUrl: "./src/assets/moduleCards/card-3.svg",
      videoUrl: "./src/assets/animations/video5.mp4",
      light: true,
      pageUrl: "/anxiety-module",

   },
];

export const socials = [
   {
      id: "0",
      title: "Discord",
      iconUrl: discordBlack,
      url: "#",
   },
   {
      id: "1",
      title: "Twitter",
      iconUrl: twitter,
      url: "#",
   },
   {
      id: "2",
      title: "Instagram",
      iconUrl: instagram,
      url: "#",
   },
   {
      id: "3",
      title: "Telegram",
      iconUrl: telegram,
      url: "#",
   },
   {
      id: "4",
      title: "Facebook",
      iconUrl: facebook,
      url: "#",
   },
];
