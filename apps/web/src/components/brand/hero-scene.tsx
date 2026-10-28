import { cn } from "@/lib/utils";

/**
 * Kathmandu Valley at dusk (light) / lamp-lit night (dark): hills, snow peaks,
 * a tiered pagoda (left), Swayambhu-style stupa with prayer flags (right), city lights.
 * Pure SVG, ~6 KB, themed by CSS variables in toly-patterns.css. Use behind the home hero
 * and the sign-in brand panel. Pass a unique idPrefix if two scenes share a page. Parent must be `relative isolate overflow-hidden`.
 */
export function HeroScene({
  className,
  idPrefix = "hs",
}: {
  className?: string;
  idPrefix?: string;
}) {
  return (
    <svg
      className={cn(
        "scene pointer-events-none absolute inset-0 -z-10 h-full w-full",
        className,
      )}
      viewBox="0 0 1256 860"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${idPrefix}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="sk1" />
          <stop offset=".52" className="sk2" />
          <stop offset=".86" className="sk3" />
        </linearGradient>
        <radialGradient id={`${idPrefix}-glow`} cx=".5" cy=".5" r=".5">
          <stop offset="0" className="gl1" />
          <stop offset="1" className="gl2" />
        </radialGradient>
        <linearGradient id={`${idPrefix}-far`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="fr1" />
          <stop offset="1" className="fr2" />
        </linearGradient>
      </defs>
      <rect width="1256" height="860" fill={`url(#${idPrefix}-sky)`} />
      <g className="stars">
        <circle cx="80" cy="90" r="1.2" />
        <circle cx="160" cy="40" r="1" />
        <circle cx="230" cy="130" r="1.4" />
        <circle cx="310" cy="70" r="1" />
        <circle cx="390" cy="160" r="1.2" />
        <circle cx="470" cy="50" r="1" />
        <circle cx="540" cy="110" r="1.3" />
        <circle cx="610" cy="30" r="1" />
        <circle cx="700" cy="140" r="1.1" />
        <circle cx="760" cy="60" r="1.4" />
        <circle cx="840" cy="120" r="1" />
        <circle cx="910" cy="40" r="1.2" />
        <circle cx="980" cy="150" r="1" />
        <circle cx="1050" cy="80" r="1.3" />
        <circle cx="1190" cy="120" r="1" />
        <circle cx="60" cy="220" r="1.1" />
        <circle cx="140" cy="300" r="1" />
        <circle cx="250" cy="250" r="1.3" />
        <circle cx="1000" cy="260" r="1" />
        <circle cx="1080" cy="230" r="1.2" />
        <circle cx="1180" cy="300" r="1" />
        <circle cx="1230" cy="210" r="1.3" />
        <circle cx="30" cy="380" r="1" />
        <circle cx="1220" cy="400" r="1.1" />
        <circle cx="420" cy="250" r="1" />
        <circle cx="860" cy="240" r="1" />
        <circle cx="330" cy="400" r="1.1" />
        <circle cx="940" cy="420" r="1" />
      </g>
      <g className="moon">
        <circle cx="1124" cy="168" r="44" fill="#FFE9C4" opacity=".08" />
        <circle cx="1124" cy="168" r="20" fill="#FFEFD2" />
        <circle cx="1131" cy="161" r="17" fill="#0A0B22" />
      </g>
      <ellipse
        cx="628"
        cy="650"
        rx="560"
        ry="300"
        fill={`url(#${idPrefix}-glow)`}
      />
      <path
        d="M0 650 L60 622 L110 636 L180 588 L230 610 L290 560 L335 590 L380 576 L440 610 L510 580 L565 552 L610 582 L670 568 L730 605 L800 578 L860 548 L910 572 L970 556 L1030 595 L1090 570 L1150 590 L1200 566 L1256 585 L1256 860 L0 860Z"
        fill={`url(#${idPrefix}-far)`}
      />
      <path
        className="c-snow"
        opacity=".75"
        d="M290 560 L308 573 L299 576 L316 583 L335 590 L320 589 L290 569Z M565 552 L580 565 L572 568 L590 575 L610 582 L588 579 L565 561Z M860 548 L876 560 L868 564 L890 570 L910 572 L884 573 L860 556Z M180 588 L194 598 L188 600 L204 605 L184 604Z M1200 566 L1214 575 L1208 578 L1226 580 L1204 581Z"
      />
      <path
        className="c-mid"
        d="M0 700 C140 676 260 664 380 680 C500 696 600 668 720 660 C840 652 920 668 990 690 L990 860 L0 860Z"
      />
      <path
        className="c-mid"
        d="M940 730 C1010 704 1060 690 1110 690 C1160 690 1210 702 1256 712 L1256 860 L940 860Z"
      />
      <g className="c-sil">
        <rect x="1040" y="682" width="140" height="8" rx="2" />
        <rect x="1050" y="674" width="120" height="9" rx="2" />
        <path d="M1056 676 A54 54 0 0 1 1164 676 Z" />
        <rect x="1094" y="600" width="32" height="23" rx="1" />
        <path d="M1097 600 L1123 600 L1116 548 L1104 548 Z" />
        <path d="M1098 548 L1122 548 L1110 534 Z" />
        <rect x="1109" y="518" width="2" height="16" />
      </g>
      <g fill="none" className="c-str" strokeWidth=".9">
        <path d="M1110 522 Q1040 610 990 712" />
        <path d="M1110 522 Q1180 610 1240 712" />
      </g>
      <g className="flags">
        <rect x="1085.9" y="551" width="7" height="9" fill="#94AACB" />
        <rect x="1066.3" y="578" width="7" height="9" fill="#FBF8F3" />
        <rect x="1047.5" y="606" width="7" height="9" fill="#D79595" />
        <rect x="1029.7" y="634" width="7" height="9" fill="#93B79F" />
        <rect x="1012.7" y="663" width="7" height="9" fill="#E3C788" />
        <rect x="996.7" y="692" width="7" height="9" fill="#94AACB" />
        <rect x="1127.3" y="551" width="7" height="9" fill="#E3C788" />
        <rect x="1147.6" y="578" width="7" height="9" fill="#93B79F" />
        <rect x="1167.5" y="606" width="7" height="9" fill="#D79595" />
        <rect x="1186.9" y="634" width="7" height="9" fill="#FBF8F3" />
        <rect x="1205.9" y="663" width="7" height="9" fill="#94AACB" />
        <rect x="1224.4" y="692" width="7" height="9" fill="#E3C788" />
      </g>
      <path
        className="c-near"
        d="M0 740 C120 730 220 728 320 736 C460 748 560 760 700 752 C840 744 960 734 1100 742 C1180 746 1230 752 1256 750 L1256 860 L0 860Z"
      />
      <g className="c-sil">
        <rect x="110" y="720" width="120" height="11" rx="1" />
        <rect x="118" y="710" width="104" height="11" rx="1" />
        <rect x="126" y="700" width="88" height="11" rx="1" />
        <rect x="134" y="690" width="72" height="11" rx="1" />
        <rect x="142" y="680" width="56" height="11" rx="1" />
        <rect x="150" y="660" width="40" height="21" />
        <path d="M122 666 Q132 660 144 646 L196 646 Q208 660 218 666 Z" />
        <rect x="154" y="630" width="32" height="17" />
        <path d="M130 634 Q139 628 148 616 L192 616 Q201 628 210 634 Z" />
        <rect x="157" y="602" width="26" height="15" />
        <path d="M137 604 Q145 598 152 588 L188 588 Q195 598 203 604 Z" />
        <rect x="160" y="576" width="20" height="13" />
        <path d="M143 578 Q150 572 156 563 L184 563 Q190 572 197 578 Z" />
        <rect x="162" y="552" width="16" height="12" />
        <path d="M149 554 Q155 548 160 540 L180 540 Q185 548 191 554 Z" />
        <path d="M168 540 L172 540 L171 526 L169 526 Z" />
        <circle cx="170" cy="524" r="2.2" />
      </g>
      <g className="lamps">
        <circle cx="116" cy="718" r="1.6" />
        <circle cx="132" cy="718" r="1.6" />
        <circle cx="148" cy="718" r="1.6" />
        <circle cx="192" cy="718" r="1.6" />
        <circle cx="208" cy="718" r="1.6" />
        <circle cx="224" cy="718" r="1.6" />
        <circle cx="131" cy="698" r="1.5" />
        <circle cx="209" cy="698" r="1.5" />
        <rect x="166" y="666" width="8" height="14" rx="1" />
        <rect x="167" y="634" width="6" height="9" rx="1" />
        <circle cx="1046" cy="679" r="1.6" />
        <circle cx="1062" cy="679" r="1.6" />
        <circle cx="1078" cy="679" r="1.6" />
        <circle cx="1094" cy="679" r="1.6" />
        <circle cx="1110" cy="679" r="1.6" />
        <circle cx="1126" cy="679" r="1.6" />
        <circle cx="1142" cy="679" r="1.6" />
        <circle cx="1158" cy="679" r="1.6" />
        <circle cx="1174" cy="679" r="1.6" />
        <rect x="1102" y="608" width="5" height="3" rx="1" />
        <rect x="1113" y="608" width="5" height="3" rx="1" />
      </g>
      <path
        className="c-front"
        d="M0 800 C200 784 380 790 580 800 C780 810 980 786 1256 792 L1256 860 L0 860Z"
      />
      <g className="city">
        <circle cx="40" cy="790" r="1.4" />
        <circle cx="72" cy="812" r="1.8" />
        <circle cx="95" cy="798" r="1.3" />
        <circle cx="130" cy="826" r="1.6" />
        <circle cx="160" cy="808" r="1.3" />
        <circle cx="205" cy="840" r="1.8" />
        <circle cx="240" cy="818" r="1.4" />
        <circle cx="270" cy="800" r="1.3" />
        <circle cx="300" cy="834" r="1.6" />
        <circle cx="338" cy="812" r="1.4" />
        <circle cx="372" cy="846" r="1.8" />
        <circle cx="410" cy="820" r="1.3" />
        <circle cx="445" cy="806" r="1.5" />
        <circle cx="480" cy="836" r="1.4" />
        <circle cx="520" cy="815" r="1.7" />
        <circle cx="560" cy="848" r="1.3" />
        <circle cx="600" cy="822" r="1.5" />
        <circle cx="640" cy="808" r="1.3" />
        <circle cx="680" cy="838" r="1.8" />
        <circle cx="720" cy="818" r="1.4" />
        <circle cx="760" cy="846" r="1.5" />
        <circle cx="800" cy="822" r="1.3" />
        <circle cx="840" cy="806" r="1.6" />
        <circle cx="880" cy="832" r="1.4" />
        <circle cx="920" cy="812" r="1.3" />
        <circle cx="960" cy="846" r="1.7" />
        <circle cx="1000" cy="822" r="1.4" />
        <circle cx="1040" cy="806" r="1.3" />
        <circle cx="1080" cy="836" r="1.6" />
        <circle cx="1120" cy="818" r="1.4" />
        <circle cx="1160" cy="844" r="1.8" />
        <circle cx="1200" cy="812" r="1.3" />
        <circle cx="1236" cy="830" r="1.5" />
      </g>
    </svg>
  );
}
