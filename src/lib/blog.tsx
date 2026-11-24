import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Blog & Guides. One entry = one page at /resources/blog/<slug>.      */
/*  Company facts used here are confirmed ones only.                    */
/* ------------------------------------------------------------------ */

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  tag: string;
  color: string;
  /** cover picture (product photo with transparent background) */
  image: string;
  sections: { h: string; body: React.ReactNode }[];
  related: [label: string, href: string][];
};

const A = ({ href, children }: { href: string; children: React.ReactNode }) => <Link href={href}>{children}</Link>;

export const posts: Post[] = [
  {
    slug: "repair-vs-replace-servo-drive",
    title: "Repair vs replace a servo drive: how to decide",
    description: "A failed servo drive leaves you two choices: repair it or replace it. Here is how to decide quickly, and why the price of the part is rarely the biggest number.",
    date: "2026-10-26",
    minutes: 6,
    tag: "Decision guide",
    color: "#E11D3A",
    image: "/hero/servo-drives.webp",
    related: [["Downtime Cost Calculator", "/resources/downtime-calculator"], ["Servo drive repair", "/services/servo-drive-repair"], ["Exchange program", "/services/exchange"]],
    sections: [
      {
        h: "The biggest cost is usually downtime",
        body: (
          <>
            <p>When a servo drive fails, most people compare the price of a repair with the price of a new drive. That comparison misses the number that matters most: what every hour of a stopped line costs you.</p>
            <p>A new drive with a three-week lead time can cost far more in lost production than the drive itself. A repair with a typical 24 to 72 hour turnaround, or an exchange unit, changes the picture completely. Our <A href="/resources/downtime-calculator">Downtime Cost Calculator</A> lets you put your own numbers on it in a minute.</p>
          </>
        ),
      },
      {
        h: "When repair is the better choice",
        body: (
          <ul>
            <li><strong>The drive is discontinued or hard to get.</strong> Many machines run drives the manufacturer no longer makes. Repair keeps a proven machine running without a costly retrofit.</li>
            <li><strong>A new drive has a long lead time.</strong> If the replacement is weeks away, repair is almost always faster.</li>
            <li><strong>You want an exact match.</strong> Your own unit, repaired, goes back in with the same part number and hardware. There is no need to match a new revision or firmware to the rest of the machine.</li>
            <li><strong>The failure is a typical component fault.</strong> Power transistors (IGBTs), DC link capacitors, power supplies on the control board, fans and connectors fail with age and are repairable at component level.</li>
          </ul>
        ),
      },
      {
        h: "When replacing makes more sense",
        body: (
          <ul>
            <li><strong>Severe physical damage.</strong> Fire, water or heavy impact damage can leave a unit beyond economic repair.</li>
            <li><strong>Repeated failures from the same machine.</strong> If drives keep failing in one position, the cause may be outside the drive: a shorted motor, a damaged cable or a supply problem. Fix that first.</li>
            <li><strong>A planned upgrade.</strong> If you are already modernising the machine, a new drive family may be part of the plan.</li>
          </ul>
        ),
      },
      {
        h: "The middle options: exchange and refurbished",
        body: (
          <>
            <p>You do not always have to choose between waiting for a repair and buying new.</p>
            <ul>
              <li><strong>Exchange unit:</strong> we supply a tested replacement and you send us your failed unit. It is the fastest way back into production when we have the unit in stock. <A href="/services/exchange">How exchange works</A>.</li>
              <li><strong>Refurbished unit:</strong> an inspected, repaired and tested drive from our stock. Useful as a spare so the next failure costs you minutes, not days. <A href="/shop/servo-drives">Shop servo drives</A>.</li>
            </ul>
          </>
        ),
      },
      {
        h: "Five questions to answer first",
        body: (
          <ol>
            <li>Is this drive still made, and what is the real lead time for a new one?</li>
            <li>What does one hour of downtime cost us?</li>
            <li>Do we have a spare, or a backup of the drive&apos;s parameters?</li>
            <li>Has this drive position failed before?</li>
            <li>Is the damage physical, or did the drive simply stop working?</li>
          </ol>
        ),
      },
      {
        h: "Know before you decide",
        body: (
          <p>Every repair we do starts with a free evaluation. We power the unit up, find the root cause and send you a written quote before any work starts, so you can compare repair, exchange and replacement with real numbers. If a unit cannot be repaired economically, we tell you before doing any work. <A href="/request-repair">Request a repair</A>.</p>
        ),
      },
    ],
  },
  {
    slug: "how-we-test-servo-motors-and-drives",
    title: "How we test servo motors and drives on our test benches",
    description: "A repair is only as good as its test. How every unit is checked in, evaluated and run under power on our test benches before it leaves our Grand Island, NY bench.",
    date: "2026-10-26",
    minutes: 5,
    tag: "Inside our repair center",
    color: "#E11D3A",
    image: "/hero/servo-motors.webp",
    related: [["Our warranty", "/warranty"], ["Servo motor repair", "/services/servo-motor-repair"], ["How to ship us a unit", "/resources/shipping"]],
    sections: [
      {
        h: "Why testing under power matters",
        body: (
          <p>A unit can pass a bench check with a multimeter and still fail the moment it drives a real load. That is why we test units the way they work in your machine: drives run a motor, and motors run under drive control.</p>
        ),
      },
      {
        h: "1. Check-in: logged and photographed",
        body: (
          <p>When your unit arrives it is logged in our system, photographed and its condition recorded, including any wear and tear or physical damage. You always know what state it arrived in.</p>
        ),
      },
      {
        h: "2. Free evaluation: finding the root cause",
        body: (
          <p>We power the unit up and test it to find out why it failed, not just what failed. You then get our findings and a written quote. No repair work starts until you approve it.</p>
        ),
      },
      {
        h: "3. Component-level repair",
        body: (
          <p>We repair at component level: failed power devices, capacitors, supply circuits, connectors and other parts on the boards are replaced, rather than swapping whole modules. That keeps your part number, hardware and settings the same.</p>
        ),
      },
      {
        h: "4. Testing on our test benches",
        body: (
          <>
            <p>We have test benches for most units, including Fanuc, Yaskawa, Siemens, Rexroth Indramat and Allen-Bradley, and we build custom test benches when a job needs one.</p>
            <ul>
              <li><strong>Servo drives</strong> are tested with a motor, so the drive is proven under real current, not just powered on.</li>
              <li><strong>Servo motors</strong> are tested under drive control, so we see how they actually run.</li>
              <li><strong>Encoder alignment</strong> is checked on motors, because a misaligned encoder makes even a perfect motor fault. <A href="/resources/blog/encoder-alignment-explained">Why alignment matters</A>.</li>
            </ul>
          </>
        ),
      },
      {
        h: "5. Test report and warranty",
        body: (
          <p>Every repaired unit ships with a test report showing how it was tested, and is covered by our 1-year warranty. Typical turnaround is 24 to 72 hours once your quote is approved. <A href="/warranty">Read our warranty</A>.</p>
        ),
      },
    ],
  },
  {
    slug: "encoder-alignment-explained",
    title: "Encoder alignment explained: why a new or repaired motor still faults",
    description: "A servo motor can be mechanically perfect and still trip on overcurrent. The usual reason is encoder alignment: what it is and when it goes wrong.",
    date: "2026-10-26",
    minutes: 6,
    tag: "Technical guide",
    color: "#E11D3A",
    image: "/hero/encoders.webp",
    related: [["Encoder repair & alignment", "/services/encoder-repair"], ["Glossary: encoder", "/resources/glossary#encoder"], ["Fault Code Library", "/fault-codes"]],
    sections: [
      {
        h: "What encoder alignment is",
        body: (
          <>
            <p>A permanent-magnet servo motor needs to know exactly where its rotor magnets are, so the drive can switch current into the right windings at the right moment. This is called commutation.</p>
            <p>The encoder on the back of the motor reports the shaft position. Alignment (also called the encoder offset) is the relationship between the encoder&apos;s zero and the motor&apos;s magnetic position. If that relationship is wrong, the drive pushes current at the wrong angle.</p>
          </>
        ),
      },
      {
        h: "Symptoms of a misaligned encoder",
        body: (
          <ul>
            <li>Overcurrent or overload faults soon after enabling the axis</li>
            <li>Low torque, or the motor runs much hotter than normal</li>
            <li>The motor jerks, vibrates or runs better in one direction than the other</li>
            <li>High current while the motor is standing still</li>
            <li>The axis runs away or will not hold position</li>
          </ul>
        ),
      },
      {
        h: "When alignment is lost",
        body: (
          <>
            <p>Alignment is usually set when the motor is built. It can be lost whenever the encoder and shaft are separated:</p>
            <ul>
              <li>The encoder is replaced or removed</li>
              <li>The motor is rebuilt: bearings, shaft, seals or rewinding</li>
              <li>The encoder coupling slips after an impact or a crash on the machine</li>
            </ul>
            <p>That is why a motor that has had &quot;just new bearings&quot; somewhere else can come back worse than it left.</p>
          </>
        ),
      },
      {
        h: "Absolute vs incremental encoders",
        body: (
          <p>Absolute encoders know the shaft position at power-up. Incremental encoders count pulses and rely on extra commutation signals or a reference to find the magnetic position. Both need correct alignment. Some drives can identify the offset themselves; many motors have to be aligned on a test setup before they go back in the machine. See the <A href="/resources/glossary#absolute-encoder">glossary</A> for both types.</p>
        ),
      },
      {
        h: "Safety first",
        body: (
          <p>A misaligned motor can move unexpectedly when enabled. Never test an axis with people near the machine, and follow your lockout and the manufacturer&apos;s instructions. If in doubt, send the motor to a repair center that can align and test it under drive control.</p>
        ),
      },
      {
        h: "How we handle it",
        body: (
          <p>Every servo motor we repair has its encoder alignment checked, and the motor is tested under drive control on our test benches before it ships with a test report and 1-year warranty. <A href="/services/encoder-repair">Encoder repair & alignment</A>.</p>
        ),
      },
    ],
  },
  {
    slug: "siemens-1ft5-motor-runs-at-full-speed",
    title: "Siemens 1FT5 servo motor runs at full speed when enabled: causes and checks",
    description: "A 1FT5 motor that races to maximum speed the moment the drive is enabled almost always has a feedback problem, not a power problem. Here is what to check, in order.",
    date: "2026-10-29",
    minutes: 5,
    tag: "Troubleshooting",
    color: "#E11D3A",
    image: "/blog/siemens-1ft5-motor.webp",
    related: [["Servo motor repair", "/services/servo-motor-repair"], ["Encoder repair & alignment", "/services/encoder-repair"], ["SIMODRIVE 611U fault codes", "/fault-codes/siemens/simodrive-611u"]],
    sections: [
      {
        h: "What is happening",
        body: (
          <>
            <p>The Siemens 1FT5 is an older synchronous servo motor with a built-in resolver, usually run on SIMODRIVE 611A or 611U drives. When the drive is enabled and the motor takes off at full speed, the speed loop has lost its feedback: the drive thinks the motor is not turning, so it keeps asking for more speed.</p>
            <p>This often shows up right after a motor has been repaired, swapped or re-cabled. Replacing the U, V, W power cables rarely fixes it, because the power side is not the problem.</p>
          </>
        ),
      },
      {
        h: "The usual causes",
        body: (
          <ul>
            <li><strong>Resolver feedback lost or wrong.</strong> A failed resolver, or one that was disturbed during a motor repair, gives no speed signal or the wrong one.</li>
            <li><strong>Feedback cable damage.</strong> A broken conductor or a poorly connected shield in the resolver cable, often where it moves in a cable track.</li>
            <li><strong>Connector problems.</strong> Bent pins, corrosion or moisture in the round signal connector on the motor.</li>
            <li><strong>Drive measuring circuit.</strong> A fault in the resolver evaluation on the drive&apos;s control card gives bad speed feedback even with a good motor.</li>
            <li><strong>Controller settings.</strong> On analog 611A axes, gain and reset-time settings that were changed can make the axis unstable on enable.</li>
          </ul>
        ),
      },
      {
        h: "What to check, in order",
        body: (
          <ol>
            <li>Lock out the machine. Disconnect the resolver cable at both ends and check every conductor and the shield for continuity.</li>
            <li>Inspect the motor-side connector for bent pins, corrosion and water.</li>
            <li>Check that the cable shield is connected the way the drive documentation specifies. A missing or doubled shield connection causes noise in the feedback.</li>
            <li>If you have a known-good motor or cable, swap one at a time to see whether the fault follows the motor, the cable or the drive.</li>
            <li>Only then look at the controller settings, starting from conservative values and following the Siemens documentation.</li>
          </ol>
        ),
      },
      {
        h: "Safety first",
        body: (
          <p>A motor that runs away at full speed can damage the machine and hurt people. Never test with anyone near the axis, keep the load disconnected or the axis secured where you can, and follow your lockout procedure and the Siemens manuals.</p>
        ),
      },
      {
        h: "Repair or replace?",
        body: (
          <p>1FT5 motors and SIMODRIVE 611 drives are discontinued, but both are repairable. We check the resolver and its alignment, the windings and bearings, and test the motor under drive control on our test benches before it ships with a test report and 1-year warranty. If the fault is in the drive, we repair the control card too. <A href="/services/servo-motor-repair">Servo motor repair</A> · <A href="/request-repair">Request a repair</A>.</p>
        ),
      },
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
export const postUrl = (slug: string) => `/resources/blog/${slug}`;
export const prettyDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

/** The tag colour darkened enough to read as small text on its light tint. */
export function tagInk(hex: string): string {
  const n = parseInt(hex.slice(1, 7), 16);
  const mix = (c: number, d: number) => Math.round(c * 0.62 + d * 0.38);
  const r = mix((n >> 16) & 255, 11), g = mix((n >> 8) & 255, 26), b = mix(n & 255, 60);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
