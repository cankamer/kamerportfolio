import WelcomeGate from "@/components/WelcomeGate";
import IntroStage from "@/components/IntroStage";
import About from "@/components/about/About";
import Timeline from "@/components/timeline/Timeline";
import Skills from "@/components/skills/Skills";
import Hub from "@/components/hub/Hub";
import Closing from "@/components/Closing";

export default function Home() {
  return (
    <main className="relative">
      <WelcomeGate />
      <IntroStage />
      <Timeline />
      <About />
      <Skills />
      <Hub />
      <Closing />
    </main>
  );
}
