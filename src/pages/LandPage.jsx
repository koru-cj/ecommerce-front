// web/src/pages/Login.jsx
import LandingHero from '../components/LandingHero';
import VideoPanel from '../components/VideoPanelHero';
import SectionSeparator from '../components/SectionSeparator';
import './styles/LandPage.css'

export default function LandPage() {
  return (
      <div className="LandPageContainer">   
        <LandingHero
        variant="asado"              // "tech" o "asado"
        backgroundUrl="/BraseroFuegoEterno.jpg"
        mobileUrl="/BraseroFuegoEterno.jpg"
        productName="Brasero Fuego Eterno"
        tagline="Acero, brasas y un ritual de fuego que eleva el asado."
        />
              {/* separador suave */}
        <SectionSeparator variant="asado" height={360} topFade={140} bottomFade={130} curveAmplification={1.05} />
        <div id="video">
                
            <VideoPanel
                variant="asado"
                gifFallback="/BraseroFuegoEterno.gif"  // << importante: con "/"
                // webmSrc="/video/brasero.webm"
                // mp4Src="/video/brasero.mp4"
                poster="/img/frame.jpg"
                headline="Calor real, humo envolvente"
                subhead="Disipación pareja, retención térmica y terminaciones profesionales."
                onCta={() => document.getElementById("specs")?.scrollIntoView({ behavior: "smooth" })}
                />

        </div>
      </div>

  );
}
