import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://ydtoedpdkwnhexbhncge.supabase.co",
  "sb_publishable_lGw4GOJZfPM0dRD9OogiFg_bXJaCsMn"
);
const app = document.querySelector("#app");
const params = new URLSearchParams(window.location.search);
const joinRoomCode = params.get("join");
const metricTemplate = document.querySelector("#metric-template");
function classroomShareUrl() {
  return `https://ulianazayy.github.io/feministeconomicsproject/?room=${state.roomCode}`;
}

const rounds = [
  {
    id: "first-job",
    title: "Salary Negotiation",
    kicker: "Round 01 / First job",
    prompt: "You receive your first job offer.",
    body:
      "The offer is framed as competitive and standardized. You can accept it or try to adjust the starting point of your career trajectory.",
    choices: [
      {
        id: "aggressive",
        title: "Negotiate aggressively",
        desc: "Ask for the top of the salary band and a faster review cycle.",
      },
      {
        id: "polite",
        title: "Negotiate politely",
        desc: "Request a modest adjustment while emphasizing fit and motivation.",
      },
      {
        id: "accept",
        title: "Accept immediately",
        desc: "Preserve goodwill and begin without friction.",
      },
    ],
  },
  {
    id: "networking",
    title: "Informal Network",
    kicker: "Round 02 / Networking",
    prompt: "A senior manager invites your cohort to an informal office dinner.",
    body:
      "The event is optional, but several career-relevant relationships are likely to form outside formal work hours.",
    choices: [
      { id: "attend", title: "Attend", desc: "Invest time in visibility and informal sponsorship." },
      { id: "remote", title: "Attend remotely", desc: "Stay present, but with weaker social access." },
      { id: "skip", title: "Skip", desc: "Protect time and energy for other responsibilities." },
    ],
  },
  {
    id: "family",
    title: "Family Decision",
    kicker: "Round 03 / Life-course choice",
    prompt: "You are considering major family decisions.",
    body:
      "The system records the decision as personal preference. Future rounds will evaluate availability, continuity, and support structures.",
    choices: [
      { id: "none", title: "No children", desc: "Keep current work rhythm and flexibility." },
      { id: "one", title: "One child", desc: "Add care responsibilities and new household constraints." },
      { id: "two", title: "Two children", desc: "Increase care needs and long-term time pressure." },
    ],
  },
  {
    id: "part-time",
    title: "Workload Sustainability",
    kicker: "Round 04 / Part-time work",
    prompt: "Your current workload is becoming difficult to sustain.",
    body:
      "The organization offers several pathways, each evaluated through productivity, availability, and progression metrics.",
    choices: [
      { id: "full", title: "Remain full-time", desc: "Maintain earnings and continuity with higher strain." },
      { id: "part", title: "Switch to part-time", desc: "Reduce pressure while slowing salary and pension growth." },
      { id: "break", title: "Take a career break", desc: "Stabilize life demands with a major continuity cost." },
    ],
  },
  {
    id: "promotion",
    title: "Promotion Review",
    kicker: "Round 05 / Leadership review",
    prompt: "You are included in the annual leadership review.",
    body:
      "The panel compares performance, visibility, availability, and perceived leadership readiness across the cohort.",
    choices: [
      {
        id: "performance",
        title: "Emphasize measurable performance",
        desc: "Lead with results, revenue contribution, and delivery metrics.",
      },
      {
        id: "team",
        title: "Emphasize team contribution",
        desc: "Highlight coordination, mentoring, and operational reliability.",
      },
      {
        id: "availability",
        title: "Emphasize availability and ambition",
        desc: "Signal readiness for high-visibility work and leadership hours.",
      },
    ],
  },
  {
    id: "care",
    title: "Care Burden",
    kicker: "Round 06 / Aging parents",
    prompt: "An aging parent requires additional support.",
    body:
      "The care need is not formally part of work, but it affects time, attention, energy, and financial planning.",
    choices: [
      { id: "direct", title: "Provide care directly", desc: "Reduce paid care costs while absorbing time pressure." },
      { id: "shared", title: "Coordinate shared care", desc: "Try to distribute responsibilities across family members." },
      { id: "outsource", title: "Outsource care", desc: "Protect time while reducing savings." },
    ],
  },
];

const state = {
  screen: "landing",
  mode: null,
  playerName: "",
  participantCount: 20,
  participantNumber: 1,
  roomCode: generateRoomCode(),
  roundIndex: 0,
  outcome: null,
  players: [],
  selectedPlayerId: "participant-01",
  revealStep: 0,
  selectedAnalysisPlayer: null,
  counterfactualPlayer: null,
  comparisonMode: "actual-vs-counterfactual",
  selectedTimelineEvent: null,
  policySimulationSettings: {
    salaryTransparency: false,
    universalChildcare: false,
    equalParentalLeave: false,
    leadershipDiversityQuotas: false,
    subsidizedElderCare: false,
  },
};
async function createRoom() {
  const roomCode = generateRoomCode();

  const { data, error } = await supabase
    .from("rooms")
    .insert([
      {
        code: roomCode,
        participant_count: state.participantCount,
        current_round: 0,
        status: "lobby",
      },
    ])
    .select()
    .single();

  console.log("ROOM CREATED:");
  console.log(data);
  console.log(error);
  if (data) {
  state.roomCode = data.code;
  render();
}

  return data;
}
async function loadPlayers() {
  const { data, error } = await supabase
    .from("players")
    .select("*");

  console.log("PLAYERS:");
  console.log(data);

  if (!error) {
    state.players = data;
    render();
  }
}
async function assignSeat(roomId) {
  const { data: players } = await supabase
    .from("players")
    .select("seat_number")
    .eq("room_id", roomId);

  const usedSeats = players.map(p => p.seat_number);

  const availableSeats = [];

  for (let i = 1; i <= state.participantCount; i++) {
    if (!usedSeats.includes(i)) {
      availableSeats.push(i);
    }
  }
async function joinRoom(playerName) {
  const { data: room } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", state.roomCode)
    .single();

  if (!room) {
    alert("Room not found");
    return;
  }

  const seatNumber = await assignSeat(room.id);

  const { data, error } = await supabase
    .from("players")
    .insert([
      {
        room_id: room.id,
        display_name: playerName,
        seat_number: seatNumber,
      },
    ])
    .select()
    .single();

  console.log("PLAYER JOINED");
  console.log(data);
  console.log(error);

  if (data) {
    state.participantNumber = seatNumber;
    loadPlayers();
  }
}
  const randomSeat =
    availableSeats[
      Math.floor(Math.random() * availableSeats.length)
    ];

  return randomSeat;
}
function generateRoomCode() {
  return Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();
}

const hiddenProfiles = {
  feminine: {
    genderPath: "feminine-coded",
    motherhoodPenaltyRisk: 0.74,
    leadershipBias: 0.1,
    networkingAccess: -0.08,
    unpaidCareProbability: 0.68,
    negotiationPenalty: 0.045,
    partnerCareSupport: 0.35,
    growthDrag: 0.009,
  },
  masculine: {
    genderPath: "masculine-coded",
    motherhoodPenaltyRisk: 0.12,
    leadershipBias: 0.025,
    networkingAccess: 0.06,
    unpaidCareProbability: 0.34,
    negotiationPenalty: 0.006,
    partnerCareSupport: 0.72,
    growthDrag: 0.002,
  },
};

const simulatedChoicePatterns = [
  ["polite", "remote", "one", "part", "team", "shared"],
  ["aggressive", "attend", "two", "full", "availability", "shared"],
  ["polite", "skip", "two", "part", "performance", "direct"],
  ["aggressive", "attend", "none", "full", "availability", "outsource"],
  ["accept", "remote", "one", "full", "performance", "shared"],
  ["polite", "attend", "none", "full", "team", "outsource"],
  ["aggressive", "skip", "two", "break", "performance", "direct"],
  ["accept", "attend", "one", "part", "availability", "shared"],
];

const backendAdapterDraft = {
  rooms: ["id", "code", "host_id", "status", "current_round", "participant_count", "created_at"],
  players: ["id", "room_id", "seat_number", "public_label", "display_name", "hidden_profile", "state"],
  decisions: ["id", "room_id", "player_id", "round_id", "choice_id", "created_at"],
  events: ["id", "room_id", "player_id", "round_id", "public_note", "private_effects"],
};

const policyDefinitions = [
  {
    id: "salaryTransparency",
    label: "Salary transparency",
    effect: "Reduces negotiation penalties and narrows starting salary drift.",
  },
  {
    id: "universalChildcare",
    label: "Universal childcare",
    effect: "Reduces care-hour shocks after family decisions.",
  },
  {
    id: "equalParentalLeave",
    label: "Equal parental leave",
    effect: "Reduces parenthood-related availability assumptions.",
  },
  {
    id: "leadershipDiversityQuotas",
    label: "Leadership diversity quotas",
    effect: "Reduces promotion and leadership-readiness bias coefficients.",
  },
  {
    id: "subsidizedElderCare",
    label: "Subsidized elder care",
    effect: "Reduces late-life unpaid care burden and savings pressure.",
  },
];

const researchCards = [
  {
    title: "Negotiation",
    text:
      "Women who initiate negotiations can face stronger social penalties than men for comparable behavior.",
    source: "Bowles, Babcock, and Lai",
    url: "https://dash.harvard.edu/entities/publication/23da8023-2ef1-4ebc-b0a8-921d0a994073",
  },
  {
    title: "Motherhood Penalty",
    text:
      "Research finds mothers penalized in hiring, perceived competence, and recommended starting salary.",
    source: "Correll, Benard, and Paik",
    url: "https://sociology.stanford.edu/publications/getting-job-there-motherhood-penalty",
  },
  {
    title: "Leadership Bias",
    text:
      "Role congruity theory explains how leadership traits can be evaluated differently when associated with women.",
    source: "Eagly and Karau",
    url: "https://pubmed.ncbi.nlm.nih.gov/12088246/",
  },
  {
    title: "Pay Gap",
    text:
      "The European Parliament reported an EU average gender pay gap of 12% in 2023.",
    source: "European Parliament",
    url: "https://www.europarl.europa.eu/topics/en/article/20200109STO69925/understanding-the-gender-pay-gap-definition-and-causes",
  },
  {
    title: "Unpaid Care",
    text:
      "EIGE reports that care intensity remains unevenly distributed and shapes labor-market participation.",
    source: "EIGE",
    url: "https://eige.europa.eu/newsroom/care-and-gender",
  },
  {
    title: "Pension Gap",
    text:
      "Part-time work, career interruptions, lower pay, and unpaid care accumulate into lower pension outcomes.",
    source: "European Parliament report",
    url: "https://www.europarl.europa.eu/doceo/document/A-10-2026-0021_EN.html",
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function eur(value, options = {}) {
  const maximumFractionDigits = options.compact ? 1 : 0;
  if (options.compact && value >= 1000000) {
    return `EUR ${(value / 1000000).toFixed(1)}M`;
  }
  if (options.compact && value >= 1000) {
    return `EUR ${Math.round(value / 1000)}k`;
  }
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits,
  }).format(value);
}

function number(value) {
  return new Intl.NumberFormat("en-IE", { maximumFractionDigits: 0 }).format(value);
}

function participantLabel(numberValue) {
  return `Participant ${String(numberValue).padStart(2, "0")}`;
}

function participantId(numberValue) {
  return `participant-${String(numberValue).padStart(2, "0")}`;
}

function hiddenProfileTypeForSeat(numberValue) {
  return numberValue % 2 === 0 ? "masculine" : "feminine";
}

function defaultChoicesForSeat(numberValue) {
  return simulatedChoicePatterns[(numberValue - 1) % simulatedChoicePatterns.length];
}

function createPlayer(id, characterName, displayName, visibleProfile, profileType, seatNumber) {
  const player = {
    id,
    characterName,
    displayName,
    publicLabel: characterName,
    seatNumber,
    visibleProfile,
    hiddenProfile: { ...hiddenProfiles[profileType] },
    salary: 2500,
    savings: 1800,
    pension: 0,
    stress: 22,
    energy: 86,
    promotionScore: 48,
    careHours: 0,
    networkingScore: 32,
    careerLevel: 1,
    discriminationExposure: 0,
    uninterruptedCareerYears: 0,
    partTimeYears: 0,
    lifetimeEarnings: 0,
    employmentIntensity: 1,
    children: 0,
    promotionCount: 0,
    decisions: [],
    auditTrail: [],
    eventLog: [],
    history: [],
    effects: {
      negotiation: 0,
      motherhood: 0,
      promotions: 0,
      partTime: 0,
      care: 0,
      pension: 0,
      networking: 0,
    },
  };
  pushHistory(player, "Start");
  return player;
}

function initializeGame() {
  const visibleProfile = {
    age: 22,
    education: "Economics degree",
    field: "Business analytics",
    ambition: "High",
    startingSalary: 2500,
  };
  const count = clamp(Number(state.participantCount) || 20, 4, 20);
  const selectedNumber = 1;
  state.participantCount = count;
  state.players = Array.from({ length: count }, (_, index) => {
    const seatNumber = index + 1;
    const id = participantId(seatNumber);
    const label = participantLabel(seatNumber);
    const displayName = seatNumber === selectedNumber ? state.playerName.trim() || "You" : label;
    return createPlayer(
      id,
      label,
      displayName,
      { ...visibleProfile },
      hiddenProfileTypeForSeat(seatNumber),
      seatNumber,
    );
  });
  state.selectedPlayerId = participantId(selectedNumber);
  state.roundIndex = 0;
  state.outcome = null;
  state.revealStep = 0;
}

function selectedPlayer() {
  return state.players.find((player) => player.id === state.selectedPlayerId);
}

function pushHistory(player, label) {
  player.history.push({
    label,
    salary: Math.round(player.salary),
    pension: Math.round(player.pension),
    stress: Math.round(player.stress),
    careHours: Math.round(player.careHours),
    lifetimeEarnings: Math.round(player.lifetimeEarnings),
  });
}

function applyPolicyToHiddenProfile(hiddenProfile, policies = {}) {
  const adjusted = { ...hiddenProfile };
  if (policies.salaryTransparency) {
    adjusted.negotiationPenalty *= 0.35;
  }
  if (policies.equalParentalLeave) {
    adjusted.motherhoodPenaltyRisk *= 0.55;
    adjusted.partnerCareSupport = Math.max(adjusted.partnerCareSupport, 0.62);
  }
  if (policies.leadershipDiversityQuotas) {
    adjusted.leadershipBias *= 0.45;
  }
  if (policies.universalChildcare) {
    adjusted.unpaidCareProbability *= 0.62;
  }
  if (policies.subsidizedElderCare) {
    adjusted.unpaidCareProbability *= 0.72;
  }
  return adjusted;
}

function choiceTitle(round, choiceId) {
  return round.choices.find((choice) => choice.id === choiceId)?.title || choiceId;
}

function applyChoice(player, round, choiceId, isControlled, options = {}) {
  const before = snapshotPlayer(player);
  const hidden = player.hiddenProfile;
  const policies = options.policySettings || {};
  let note = "Dashboard metrics updated according to the institutional model.";
  let headline = "Outcome processed";
  let institutionalEffect = "Hidden institutional scoring adjusted trajectory variables.";
  let visibleEffect = "Visible dashboard metrics updated.";
  let researchConnection = "This round connects individual choices to institutional evaluation systems.";

  if (round.id === "first-job") {
    if (choiceId === "aggressive") {
      const boost = hidden.genderPath === "feminine-coded"
        ? 0.025 + (policies.salaryTransparency ? 0.028 : 0)
        : 0.085;
      player.salary *= 1 + boost;
      player.energy -= 2;
      player.promotionScore += hidden.genderPath === "feminine-coded" ? -3 : 4;
      player.discriminationExposure += hidden.genderPath === "feminine-coded" ? 2 : 0;
      player.effects.negotiation += hidden.genderPath === "feminine-coded"
        ? policies.salaryTransparency ? 24000 : 47000
        : 8000;
      note =
        hidden.genderPath === "feminine-coded"
          ? "The employer noted a strong compensation stance and adjusted interpersonal fit expectations."
          : "The employer noted a strong compensation stance and increased leadership-readiness confidence.";
      headline = "Compensation review completed";
      visibleEffect = "Starting compensation moved upward from the baseline offer.";
      institutionalEffect = "Negotiation behavior was evaluated through different interpersonal-fit assumptions.";
      researchConnection = "Negotiation backlash research shows that equivalent assertiveness may receive different social evaluations.";
    }
    if (choiceId === "polite") {
      player.salary *= hidden.genderPath === "feminine-coded"
        ? 1.018 + (policies.salaryTransparency ? 0.014 : 0)
        : 1.042;
      player.promotionScore += 1;
      player.effects.negotiation += hidden.genderPath === "feminine-coded"
        ? policies.salaryTransparency ? 11000 : 21000
        : 4000;
      note = "The offer was adjusted within the lower discretionary range.";
      headline = "Offer adjusted";
      visibleEffect = "Salary increased modestly.";
      institutionalEffect = "Discretionary salary band access remained uneven.";
      researchConnection = "Salary transparency can reduce unexplained discretion in starting offers.";
    }
    if (choiceId === "accept") {
      player.energy += 3;
      player.promotionScore += 1;
      player.effects.negotiation += 32000;
      note = "The acceptance preserved onboarding momentum and avoided negotiation friction.";
      headline = "Offer accepted";
      visibleEffect = "Energy and onboarding stability improved.";
      institutionalEffect = "Early salary baseline remained unchanged and continued compounding.";
      researchConnection = "Small starting differences can compound through percentage-based raises.";
    }
  }

  if (round.id === "networking") {
    if (choiceId === "attend") {
      player.networkingScore += 17 + hidden.networkingAccess * 40;
      player.energy -= 6;
      player.effects.networking += hidden.genderPath === "feminine-coded" ? 9000 : 2500;
      note = "Informal sponsor contact added to your network.";
      headline = "Network visibility increased";
      visibleEffect = "Network visibility increased while energy decreased.";
      institutionalEffect = "Informal access converted into future promotion probability.";
      researchConnection = "Informal networks can shape sponsorship and advancement outside formal evaluation.";
    }
    if (choiceId === "remote") {
      player.networkingScore += 7 + hidden.networkingAccess * 24;
      player.energy -= 2;
      player.effects.networking += hidden.genderPath === "feminine-coded" ? 15000 : 5000;
      note = "Partial attendance registered with limited informal contact.";
      headline = "Remote participation logged";
      visibleEffect = "Visibility increased less than in-person attendance.";
      institutionalEffect = "Reduced informal access lowered future sponsor contact probability.";
      researchConnection = "Visibility and sponsorship can depend on after-hours participation norms.";
    }
    if (choiceId === "skip") {
      player.energy += 5;
      player.networkingScore -= hidden.genderPath === "feminine-coded" ? 3 : 1;
      player.effects.care += hidden.genderPath === "feminine-coded" ? 8000 : 2000;
      player.effects.networking += hidden.genderPath === "feminine-coded" ? 26000 : 9000;
      note = "Visibility score remained stable while informal network formation continued elsewhere.";
      headline = "Invitation declined";
      visibleEffect = "Energy improved while network score softened.";
      institutionalEffect = "Informal network formation continued without equal access.";
      researchConnection = "Career systems often reward availability outside formal work time.";
    }
  }

  if (round.id === "family") {
    const children = choiceId === "none" ? 0 : choiceId === "one" ? 1 : 2;
    player.children = children;
    if (children === 0) {
      player.energy += 2;
      player.uninterruptedCareerYears += 2;
      note = "Continuity metric remained unchanged.";
      headline = "Family profile recorded";
      visibleEffect = "Career continuity increased.";
      institutionalEffect = "Availability assumptions remained stable.";
      researchConnection = "Continuity metrics can reward uninterrupted career paths.";
    } else {
      const carePolicyFactor = policies.universalChildcare ? 0.58 : 1;
      const parentalPolicyFactor = policies.equalParentalLeave ? 0.55 : 1;
      const careIncrease = Math.round(children * (hidden.genderPath === "feminine-coded" ? 820 : 360) * carePolicyFactor);
      player.careHours += careIncrease;
      player.stress += children * (hidden.genderPath === "feminine-coded" ? 9 : 5) * parentalPolicyFactor;
      player.energy -= children * 6;
      player.promotionScore -= children * (hidden.genderPath === "feminine-coded" ? 5 : 1) * parentalPolicyFactor;
      player.discriminationExposure += hidden.genderPath === "feminine-coded" ? children * 2 * parentalPolicyFactor : 0;
      player.effects.motherhood += hidden.genderPath === "feminine-coded"
        ? children * (policies.equalParentalLeave ? 39000 : 76000)
        : 0;
      player.effects.care += children * careIncrease * 8;
      note =
        hidden.genderPath === "feminine-coded"
          ? "Availability assumptions were adjusted in the long-term leadership model."
          : "Availability assumptions were reviewed in the long-term leadership model.";
      headline = "Household change registered";
      visibleEffect = "Care hours, stress, and energy changed after the household decision.";
      institutionalEffect = "Parenthood-related availability assumptions affected future promotion scoring.";
      researchConnection = "Motherhood-penalty research links parenthood status to perceived availability and competence.";
    }
  }

  if (round.id === "part-time") {
    if (choiceId === "full") {
      player.employmentIntensity = 1;
      player.stress += player.children > 0 ? 12 : 6;
      player.energy -= player.children > 0 ? 9 : 4;
      player.uninterruptedCareerYears += 4;
      note = "Continuity metric strengthened while personal sustainability pressure increased.";
      headline = "Full-time continuity maintained";
      visibleEffect = "Salary and pension continuity remained strong.";
      institutionalEffect = "The continuity metric rewarded uninterrupted full-time employment.";
      researchConnection = "Pension systems often compound advantages from continuous full-time employment.";
    }
    if (choiceId === "part") {
      player.employmentIntensity = 0.68;
      player.partTimeYears += 4;
      player.stress -= 6;
      player.energy += 6;
      player.promotionScore -= 7;
      player.effects.partTime += 110000;
      player.effects.pension += 46000;
      note = "Reduced hours improved sustainability and lowered projected pension contributions.";
      headline = "Part-time status approved";
      visibleEffect = "Stress decreased while salary and pension growth slowed.";
      institutionalEffect = "Part-time status reduced continuity and promotion-readiness metrics.";
      researchConnection = "Part-time work and career interruptions contribute to lower lifetime earnings and pensions.";
    }
    if (choiceId === "break") {
      player.employmentIntensity = 0.25;
      player.partTimeYears += 6;
      player.stress -= 15;
      player.energy += 12;
      player.promotionScore -= 15;
      player.uninterruptedCareerYears = 0;
      player.effects.partTime += 190000;
      player.effects.pension += 76000;
      note = "Career continuity metric reset after extended interruption.";
      headline = "Career break recorded";
      visibleEffect = "Stress decreased sharply while career continuity reset.";
      institutionalEffect = "The system treated interruption as a long-term progression penalty.";
      researchConnection = "Career breaks create compounding effects through missed raises, pension contributions, and promotions.";
    }
  }

  if (round.id === "promotion") {
    const boardDiversityModifier = 0.15;
    const availabilityScore =
      player.energy - player.stress * 0.25 - player.careHours * 0.01 - player.partTimeYears * 2;
    let choiceBoost = 0;
    if (choiceId === "performance") choiceBoost = 0.05;
    if (choiceId === "team") choiceBoost = hidden.genderPath === "feminine-coded" ? 0.015 : 0.03;
    if (choiceId === "availability") choiceBoost = hidden.genderPath === "feminine-coded" ? 0.025 : 0.08;

    const chance = clamp(
      0.25 +
        player.networkingScore * 0.004 +
        player.uninterruptedCareerYears * 0.02 +
        availabilityScore * 0.003 +
        choiceBoost -
        hidden.leadershipBias * (1 - boardDiversityModifier) -
        player.discriminationExposure * 0.015,
      0.04,
      0.86,
    );
    const promoted = chance >= (hidden.genderPath === "feminine-coded" ? 0.58 : 0.46);

    if (promoted) {
      player.careerLevel += 1;
      player.promotionCount += 1;
      player.salary *= 1.16;
      player.promotionScore += 8;
      note = "Panel selected your profile for expanded leadership responsibility.";
      headline = "Promotion approved";
      visibleEffect = "Career level and monthly salary increased.";
      institutionalEffect = "Visibility, continuity, and availability metrics cleared the leadership threshold.";
      researchConnection = "Leadership pipelines reward accumulated visibility and uninterrupted career signals.";
    } else {
      player.promotionScore -= 3;
      player.effects.promotions += 145000;
      player.effects.pension += 38000;
      note = "Review panel selected candidates with stronger perceived leadership continuity.";
      headline = "Promotion deferred";
      visibleEffect = "Career level remained unchanged and salary compounding slowed.";
      institutionalEffect = "Leadership-readiness assumptions reduced promotion probability.";
      researchConnection = "Role congruity theory describes how leadership potential can be evaluated through biased expectations.";
    }
  }

  if (round.id === "care") {
    if (choiceId === "direct") {
      const hours = Math.round((hidden.genderPath === "feminine-coded" ? 1700 : 850) * (policies.subsidizedElderCare ? 0.62 : 1));
      player.careHours += hours;
      player.stress += (hidden.genderPath === "feminine-coded" ? 14 : 8) * (policies.subsidizedElderCare ? 0.72 : 1);
      player.energy -= hidden.genderPath === "feminine-coded" ? 11 : 6;
      player.effects.care += hours * 12;
      note = "Family coordination defaulted to the most available household member.";
      headline = "Direct care assumed";
      visibleEffect = "Care hours and stress increased.";
      institutionalEffect = "Unpaid care burden reduced availability and savings growth.";
      researchConnection = "Unpaid care work affects paid labor participation, stress, and long-term financial outcomes.";
    }
    if (choiceId === "shared") {
      const success = hidden.partnerCareSupport > 0.5;
      const elderCareFactor = policies.subsidizedElderCare ? 0.68 : 1;
      const hours = Math.round((success ? 520 : 1250) * elderCareFactor);
      player.careHours += hours;
      player.stress += success ? 5 : 11;
      player.energy -= success ? 4 : 9;
      player.savings -= (success ? 1800 : 800) * (policies.subsidizedElderCare ? 0.55 : 1);
      player.effects.care += hours * 9;
      note = success
        ? "Shared care arrangement reduced work disruption."
        : "Shared care coordination shifted back toward your schedule.";
      headline = "Care plan evaluated";
      visibleEffect = "Care hours increased according to family coordination success.";
      institutionalEffect = "Shared care access changed work-disruption exposure.";
      researchConnection = "Care distribution can alter labor-market continuity without appearing in formal job metrics.";
    }
    if (choiceId === "outsource") {
      player.careHours += 260;
      player.savings -= 9500 * (policies.subsidizedElderCare ? 0.45 : 1);
      player.stress += 3;
      player.effects.care += 6000;
      note = "Paid care protected availability while reducing liquid savings.";
      headline = "External care arranged";
      visibleEffect = "Availability was protected while savings decreased.";
      institutionalEffect = "Outsourcing converted care burden into direct financial cost.";
      researchConnection = "Public elder-care support changes whether care costs appear as unpaid hours or out-of-pocket spending.";
    }
  }

  compoundCareer(player, round.id === "family" ? 7 : 6);
  pushHistory(player, round.title);
  const after = snapshotPlayer(player);
  const outcome = buildOutcome(before, after, headline, note);
  const auditEntry = {
    age: 22 + player.auditTrail.length * 7,
    roundId: round.id,
    roundName: round.title,
    choiceId,
    choiceTitle: choiceTitle(round, choiceId),
    headline,
    publicNote: note,
    visibleEffect,
    institutionalEffect,
    researchConnection,
    before,
    after,
    deltas: outcome.deltas,
    historyIndex: player.history.length - 1,
  };
  if (options.recordDecision !== false) {
    player.decisions.push({
      roundIndex: player.decisions.length,
      roundId: round.id,
      choiceId,
      choiceTitle: auditEntry.choiceTitle,
    });
  }
  player.auditTrail.push(auditEntry);
  if (isControlled) {
    player.eventLog.unshift({
      round: round.title,
      choice: choiceId,
      headline,
      note,
    });
  }
  return outcome;
}

function snapshotPlayer(player) {
  return {
    salary: player.salary,
    savings: player.savings,
    pension: player.pension,
    stress: player.stress,
    energy: player.energy,
    careHours: player.careHours,
    careerLevel: player.careerLevel,
  };
}

function buildOutcome(before, after, headline, note) {
  return {
    headline,
    note,
    deltas: [
      { label: "Monthly salary", value: after.salary - before.salary, formatter: eur },
      { label: "Savings", value: after.savings - before.savings, formatter: eur },
      { label: "Pension forecast", value: after.pension - before.pension, formatter: eur },
      { label: "Care hours", value: after.careHours - before.careHours, formatter: number },
      { label: "Stress", value: after.stress - before.stress, formatter: number },
      { label: "Energy", value: after.energy - before.energy, formatter: number },
    ],
  };
}

function compoundCareer(player, years) {
  for (let i = 0; i < years; i += 1) {
    const annualSalary = Math.max(0, player.salary * 12 * player.employmentIntensity);
    const careCost = player.careHours > 1000 ? player.careHours * 0.55 : player.careHours * 0.2;
    const savingsRate = clamp(0.15 - player.stress * 0.0009 - player.partTimeYears * 0.003, 0.03, 0.18);
    const pensionRate = 0.115 * player.employmentIntensity;
    const salaryGrowth = clamp(
      0.032 +
        player.careerLevel * 0.007 +
        player.promotionScore * 0.00022 +
        player.networkingScore * 0.00018 -
        player.stress * 0.00024 -
        player.careHours * 0.000002 -
        player.hiddenProfile.growthDrag,
      -0.018,
      0.075,
    );

    player.lifetimeEarnings += annualSalary;
    player.savings += annualSalary * savingsRate - careCost;
    player.pension += annualSalary * pensionRate;
    player.salary *= 1 + salaryGrowth;
    player.stress = clamp(player.stress + player.careHours * 0.00045 - player.energy * 0.012, 4, 96);
    player.energy = clamp(player.energy - player.stress * 0.018 + (player.employmentIntensity < 0.8 ? 0.9 : -0.2), 8, 96);
    player.uninterruptedCareerYears += player.employmentIntensity >= 0.85 ? 1 : 0;
  }
  player.salary = Math.max(1000, player.salary);
  player.savings = Math.max(-25000, player.savings);
  player.stress = clamp(player.stress, 0, 100);
  player.energy = clamp(player.energy, 0, 100);
  player.networkingScore = clamp(player.networkingScore, 0, 100);
  player.promotionScore = clamp(player.promotionScore, 0, 100);
}

function processRound(choiceId) {
  const round = rounds[state.roundIndex];
  state.players.forEach((player) => {
    const defaultChoice = defaultChoicesForSeat(player.seatNumber)[state.roundIndex];
    applyChoice(player, round, player.id === state.selectedPlayerId ? choiceId : defaultChoice, player.id === state.selectedPlayerId);
  });
  state.outcome = selectedPlayer().eventLog[0];
  render();
}

function swappedProfileType(player) {
  return player.hiddenProfile.genderPath === "feminine-coded" ? "masculine" : "feminine";
}

function originalProfileType(player) {
  return player.hiddenProfile.genderPath === "feminine-coded" ? "feminine" : "masculine";
}

function generateCounterfactual(player, policySettings = {}) {
  const alternate = createPlayer(
    `${player.id}-counterfactual`,
    `${player.publicLabel} / alternate`,
    "Counterfactual",
    { ...player.visibleProfile },
    swappedProfileType(player),
    player.seatNumber,
  );
  alternate.publicLabel = `${player.publicLabel} alternate`;
  alternate.hiddenProfile = applyPolicyToHiddenProfile(alternate.hiddenProfile, policySettings);
  alternate.history = [];
  pushHistory(alternate, "Start");
  const decisions = player.decisions.length
    ? player.decisions
    : rounds.map((round, index) => ({
        roundIndex: index,
        roundId: round.id,
        choiceId: defaultChoicesForSeat(player.seatNumber)[index],
      }));
  decisions.forEach((decision, index) => {
    applyChoice(alternate, rounds[index], decision.choiceId, false, {
      policySettings,
      recordDecision: true,
    });
  });
  return alternate;
}

function generatePolicyProjection(player, policySettings = {}) {
  const projected = createPlayer(
    `${player.id}-policy`,
    `${player.publicLabel} / policy`,
    "Policy projection",
    { ...player.visibleProfile },
    originalProfileType(player),
    player.seatNumber,
  );
  projected.publicLabel = `${player.publicLabel} policy`;
  projected.hiddenProfile = applyPolicyToHiddenProfile(projected.hiddenProfile, policySettings);
  projected.history = [];
  pushHistory(projected, "Start");
  player.decisions.forEach((decision, index) => {
    applyChoice(projected, rounds[index], decision.choiceId, false, {
      policySettings,
      recordDecision: true,
    });
  });
  return projected;
}

function detectDivergenceMoments(actual, counterfactual) {
  const moments = actual.history
    .slice(1)
    .map((point, index) => {
      const alternate = counterfactual.history[index + 1] || counterfactual.history[counterfactual.history.length - 1];
      const previousActual = actual.history[index] || actual.history[0];
      const previousAlternate = counterfactual.history[index] || counterfactual.history[0];
      const gap = Math.abs((alternate.lifetimeEarnings || 0) - (point.lifetimeEarnings || 0));
      const previousGap = Math.abs((previousAlternate.lifetimeEarnings || 0) - (previousActual.lifetimeEarnings || 0));
      const acceleration = gap - previousGap;
      const event = actual.auditTrail[index];
      return {
        age: event?.age || 22 + (index + 1) * 7,
        label: event?.roundName || point.label,
        reason: event?.institutionalEffect || "Trajectory separation increased through compounding.",
        choice: event?.choiceTitle || "Recorded decision",
        gap,
        acceleration,
      };
    })
    .sort((a, b) => b.acceleration - a.acceleration)
    .slice(0, 3);
  return moments;
}

function totalStructuralGap(actual, counterfactual) {
  return Math.abs(counterfactual.lifetimeEarnings - actual.lifetimeEarnings);
}

function contributionBreakdown(actual, counterfactual) {
  const raw = [
    ["Salary negotiation penalties", Math.abs((actual.effects.negotiation || 0) - (counterfactual.effects.negotiation || 0))],
    ["Missed promotion compounding", Math.abs((actual.effects.promotions || 0) - (counterfactual.effects.promotions || 0))],
    ["Care interruptions", Math.abs((actual.effects.care || 0) - (counterfactual.effects.care || 0))],
    ["Pension contribution gap", Math.abs((actual.pension || 0) - (counterfactual.pension || 0))],
    ["Networking inequality", Math.abs((actual.effects.networking || 0) - (counterfactual.effects.networking || 0))],
    ["Part-time continuity effects", Math.abs((actual.effects.partTime || 0) - (counterfactual.effects.partTime || 0))],
  ];
  const total = raw.reduce((sum, item) => sum + item[1], 0) || 1;
  const structuralGap = totalStructuralGap(actual, counterfactual);
  return raw.map(([label, value]) => [label, (value / total) * structuralGap]);
}

function percentileRank(players, player, metric, filterFn = () => true, lowerIsBetter = false) {
  const cohort = players.filter(filterFn);
  if (!cohort.length) return 0;
  const playerValue = player[metric] || 0;
  const count = cohort.filter((candidate) =>
    lowerIsBetter ? (candidate[metric] || 0) >= playerValue : (candidate[metric] || 0) <= playerValue,
  ).length;
  return Math.round((count / cohort.length) * 100);
}

function nextRound() {
  state.outcome = null;
  if (state.roundIndex < rounds.length - 1) {
    state.roundIndex += 1;
    render();
    return;
  }
  state.screen = "final";
  state.revealStep = 1;
  render();
  window.setTimeout(() => {
    if (state.screen === "final") {
      state.revealStep = 2;
      render();
    }
  }, 1200);
  window.setTimeout(() => {
    if (state.screen === "final") {
      state.revealStep = 3;
      render();
    }
  }, 2600);
}

function render() {

  if (state.screen === "landing") renderLanding();

 if (state.screen === "setup") {
  renderSetup();
}

if (state.screen === "host-setup") {
  renderHostSetup();
}

  if (state.screen === "profile") renderProfile();
  if (state.screen === "intro") renderIntro();
  if (state.screen === "round") renderRound();
  if (state.screen === "final") renderFinal();
  if (state.screen === "research") renderResearch();
  if (state.screen === "about") renderAbout();
}

function renderLanding() {
  app.innerHTML = `
    <section class="view hero">
      <div>
        <p class="eyebrow">Feminist Economics / Hybrid Simulation</p>
        <h1>Same Start,<br />Different Outcomes</h1>
        <p class="lead">
          An interactive life-course simulation about gender inequality, labor,
          care work, promotion systems, and economic outcomes.
        </p>
        <div class="hero-actions">
          <button class="primary-button" data-action="join">Join Game</button>
          <button class="ghost-button" data-action="host">Host Game</button>
          <button class="ghost-button" data-action="about">About Project</button>
        </div>
        <div class="reference-row" aria-label="Research references">
          <span>Correll / Benard / Paik</span>
          <span>Bowles / Babcock / Lai</span>
          <span>European Parliament</span>
          <span>EIGE</span>
        </div>
      </div>
      <aside class="visual-panel" aria-label="Animated salary divergence preview">
        <div class="screen-frame">
          <div class="frame-head">
            <div class="frame-dots" aria-hidden="true"><span></span><span></span><span></span></div>
            <span class="frame-title">Compensation Analytics</span>
          </div>
          <canvas class="chart-canvas" id="heroChart" width="720" height="420"></canvas>
          <div class="mini-feed">
            <div class="feed-item"><span>Starting salary variance</span><strong>0.0%</strong></div>
            <div class="feed-item"><span>Career continuity index</span><strong>Pending</strong></div>
            <div class="feed-item"><span>Hidden model status</span><strong>Active</strong></div>
          </div>
        </div>
      </aside>
    </section>
  `;
  bindPageActions();
  animateHeroChart();
}

function renderSetup() {
  const count = clamp(Number(state.participantCount) || 20, 4, 20);

  const previewSeats =
    Array.from({ length: count }, (_, index) => index + 1);

  app.innerHTML = `
    <section class="view setup-grid">

      <div class="card">

        <p class="eyebrow">Join room</p>

        <h2>Enter the session</h2>

        <p class="lead">
          Each person receives a neutral participant number.
        </p>

        <form class="field-stack" data-form="join">

          <label>
            Display name

            <input
              name="playerName"
              maxlength="24"
              placeholder="Your name"
              value="${escapeHtml(state.playerName)}"
            />
          </label>

          <label>
            Room code

            <input
              name="roomCode"
              maxlength="6"
              value="${escapeHtml(state.roomCode)}"
            />
          </label>

          <div class="form-actions">

            <button class="primary-button" type="submit">
              Join session
            </button>

            <button class="ghost-button" data-action="home">
              Back
            </button>

          </div>

        </form>

      </div>

      <aside class="card room-preview">

        <span class="room-code">
          ${escapeHtml(state.roomCode)}
        </span>

        <h3>Host lobby</h3>

        <p class="compact-note">
          ${count} seats ready.
        </p>
<div class="qr-panel">

  <img
    src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(classroomShareUrl())}"
    alt="QR code"
  />

  <div>

    <h3>Scan to join</h3>

    <p class="compact-note">
      Scan the QR code to open the session directly.
    </p>

    <a class="share-link" href="${classroomShareUrl()}">
      ${classroomShareUrl()}
    </a>

  </div>

</div>
        <div class="player-list">

          ${previewSeats.map((seat) => `
            <div class="player-row">
              <span>${participantLabel(seat)}</span>
            </div>
          `).join("")}

        </div>

      </aside>

    </section>
  `;

  bindPageActions();
  document
  .querySelector('[data-form="join"]')
  .addEventListener("submit", (event) => {

    event.preventDefault();

    const data = new FormData(event.currentTarget);

    state.playerName = data.get("playerName");
    state.roomCode = data.get("roomCode");

    initializeGame();

    state.screen = "intro";

    render();

  });
   }
 function renderHostSetup() {
  app.innerHTML = `
    <section class="view setup-grid">
      <div class="card">

        <p class="eyebrow">Host room</p>

        <h2>Create session</h2>

        <p class="lead">
          Configure the classroom simulation before participants join.
        </p>

        <form class="field-stack" data-form="host">

          <label>
            Total participants

            <input
              name="participantCount"
              type="number"
              min="4"
              max="20"
              value="${state.participantCount}"
            />
          </label>

          <div class="form-actions">

            <button class="primary-button" type="submit">
              Create room
            </button>

            <button class="ghost-button" data-action="home">
              Back
            </button>

          </div>

        </form>

      </div>
    </section>
  `;

  bindPageActions();

  document
    .querySelector('[data-form="host"]')
    .addEventListener("submit", (event) => {

      event.preventDefault();

      const data = new FormData(event.currentTarget);

      state.participantCount =
        Number(data.get("participantCount")) || 20;

      state.roomCode = generateRoomCode();

      initializeGame();

      state.screen = "setup";
      state.mode = "join";

      render();
    });
}
function renderProfile() {
  const player = selectedPlayer();
  app.innerHTML = `
    <section class="view profile-grid">
      <div>
        <p class="eyebrow">Character assignment</p>
        <h2>Your visible profile</h2>
        <p class="lead">
          All players receive comparable qualifications, ambition, and starting conditions.
          The system presents the cohort as equivalent.
        </p>
        <div class="form-actions">
          <button class="primary-button" data-action="intro">Continue</button>
          <button class="ghost-button" data-action="setup">Back</button>
        </div>
      </div>
      <article class="profile-card">
        <p class="eyebrow">Assigned profile</p>
        <h3 class="profile-name">${escapeHtml(player.characterName)}</h3>
        <div class="trait-grid">
          ${trait("Age", player.visibleProfile.age)}
          ${trait("Education", player.visibleProfile.education)}
          ${trait("Field", player.visibleProfile.field)}
          ${trait("Ambition", player.visibleProfile.ambition)}
          ${trait("Starting salary", eur(player.visibleProfile.startingSalary || 2500))}
          ${trait("Career potential", "Equivalent")}
        </div>
        <p class="compact-note">
          Hidden traits are intentionally not displayed at this stage.
        </p>
      </article>
    </section>
  `;
  bindPageActions();
}

function renderIntro() {
  app.innerHTML = `
    <section class="view intro-statement">
      <div>
        <p class="eyebrow">Game intro</p>
        <h2>All participants begin with equivalent qualifications, education, and career potential.</h2>
        <p>Your decisions will shape your future.</p>
        <div class="hero-actions" style="justify-content: center;">
          <button class="primary-button" data-action="start-rounds">Begin simulation</button>
        </div>
      </div>
    </section>
  `;
  bindPageActions();
}

function renderRound() {
  const round = rounds[state.roundIndex];
  const player = selectedPlayer();
  const progress = ((state.roundIndex + (state.outcome ? 1 : 0.25)) / rounds.length) * 100;
  app.innerHTML = `
    <section class="view">
      <div class="round-header">
        <p class="eyebrow">${round.kicker}</p>
        <div class="progress-track" aria-label="Round progress">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>
      <div class="round-grid">
        <div>
          <article class="scenario-card">
            <span class="scenario-kicker">${round.title}</span>
            <h2 class="scenario-title">${round.prompt}</h2>
            <p class="scenario-body">${round.body}</p>
          </article>
          ${
            state.outcome
              ? renderOutcome()
              : `<div class="choice-stack" style="margin-top: 16px;">
                  ${round.choices
                    .map(
                      (choice) => `
                        <button class="choice-button" data-choice="${choice.id}">
                          <strong>${choice.title}</strong>
                          <span>${choice.desc}</span>
                        </button>
                      `,
                    )
                    .join("")}
                </div>`
          }
        </div>
        ${renderDashboard(player)}
      </div>
    </section>
  `;
  bindPageActions();
  document.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => processRound(button.dataset.choice));
  });
}

function renderOutcome() {
  const outcome = selectedPlayer().eventLog[0];
  const computed = buildOutcomeFromLastHistory(selectedPlayer(), outcome);
  return `
    <div class="outcome-band">
      <article class="notification">
        <strong>${escapeHtml(outcome.headline)}</strong><br />
        ${escapeHtml(outcome.note)}
      </article>
      <div class="card">
        ${computed.deltas
          .filter((item) => Math.abs(item.value) > 0.4)
          .slice(0, 5)
          .map(
            (item) => `
              <div class="outcome-row">
                <span>${item.label}</span>
                <strong>${item.value >= 0 ? "+" : ""}${item.formatter(item.value)}</strong>
              </div>
            `,
          )
          .join("")}
        <div class="round-actions">
          <button class="primary-button" data-action="next-round">
            ${state.roundIndex === rounds.length - 1 ? "View retirement results" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  `;
}

function buildOutcomeFromLastHistory(player, outcome) {
  const last = player.history[player.history.length - 1];
  const prev = player.history[player.history.length - 2] || last;
  return {
    ...outcome,
    deltas: [
      { label: "Monthly salary", value: last.salary - prev.salary, formatter: eur },
      { label: "Pension forecast", value: last.pension - prev.pension, formatter: eur },
      { label: "Lifetime earnings", value: last.lifetimeEarnings - prev.lifetimeEarnings, formatter: eur },
      { label: "Care hours", value: last.careHours - prev.careHours, formatter: number },
      { label: "Stress", value: last.stress - prev.stress, formatter: number },
    ],
  };
}

function renderDashboard(player) {
  return `
    <aside class="dashboard" aria-label="Player dashboard">
      <div class="dashboard-head">
        <div>
          <p class="eyebrow">Persistent dashboard</p>
          <div class="dashboard-title">${escapeHtml(player.characterName)} / ${escapeHtml(player.displayName)}</div>
        </div>
        <span class="status-pill">Age ${22 + state.roundIndex * 7}</span>
      </div>
      <div class="metric-grid">
        ${metric("Salary", eur(player.salary))}
        ${metric("Savings", eur(player.savings, { compact: true }))}
        ${metric("Pension", eur(player.pension, { compact: true }))}
        ${metric("Stress", `${Math.round(player.stress)}/100`)}
        ${metric("Energy", `${Math.round(player.energy)}/100`)}
        ${metric("Career level", player.careerLevel)}
      </div>
      <div class="line-chart" aria-label="Salary and pension trajectory">
        ${lineChart(player.history, ["salary", "pension"])}
      </div>
      <p class="compact-note">
        Dashboard language remains neutral. Hidden modifiers are withheld until retirement.
      </p>
    </aside>
  `;
}

function renderFinal() {
  const sorted = [...state.players].sort((a, b) => b.lifetimeEarnings - a.lifetimeEarnings);
  const controlled = selectedPlayer();
  const showHidden = state.revealStep >= 3;
  const analysisPlayer = state.players.find((player) => player.id === state.selectedAnalysisPlayer);
  app.innerHTML = `
    <section class="dark-view">
      <div class="view final-grid">
        <div class="final-card">
          <p class="eyebrow">Final round / Retirement</p>
          <h2>Lifetime outcomes</h2>
          <p class="lead">
            The cohort started with equivalent visible qualifications. The final screen compares
            lifetime earnings, pension forecast, care hours, and cumulative exposure.
          </p>
        </div>
        <div class="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Lifetime earnings</th>
                <th>Pension forecast</th>
                <th>Care hours</th>
                <th>Stress</th>
                <th>Career level</th>
                ${showHidden ? "<th>Hidden path</th>" : ""}
              </tr>
            </thead>
            <tbody>
              ${sorted
                .map(
                  (player) => `
                    <tr class="analysis-row" data-analysis-player="${player.id}" tabindex="0" aria-label="Open life trajectory analysis for ${escapeHtml(player.publicLabel)}">
                      <td><span class="row-button">${escapeHtml(player.publicLabel)}</span></td>
                      <td>${eur(player.lifetimeEarnings, { compact: true })}</td>
                      <td>${eur(player.pension, { compact: true })}</td>
                      <td>${number(player.careHours)}</td>
                      <td>${Math.round(player.stress)}/100</td>
                      <td>${player.careerLevel}</td>
                      ${showHidden ? `<td>${escapeHtml(readableHiddenPath(player))}</td>` : ""}
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        <p class="forensic-hint">Select any participant row to open the forensic life trajectory analysis.</p>
        ${
          state.revealStep >= 2
            ? `<div class="reveal-message">
                All players began with equivalent qualifications and career potential.
              </div>`
            : ""
        }
        ${
          state.revealStep >= 3
            ? `<div class="breakdown-panel">
                <h3>Hidden structural modifiers revealed</h3>
                <p>
                  Salary growth, promotion probability, unpaid care assignment, and pension accumulation
                  were shaped by hidden institutional assumptions.
                </p>
                ${renderCohortSummary()}
                ${renderBreakdown(controlled)}
                <div class="result-actions">
                  <button class="primary-button" data-action="research">Connect to research</button>
                  <button class="ghost-button" data-action="reset">Replay</button>
                </div>
              </div>`
            : ""
        }
        ${analysisPlayer ? renderLifeTrajectoryAnalysis(analysisPlayer) : ""}
      </div>
    </section>
  `;
  bindPageActions();
  bindAnalysisInteractions();
}

function renderLifeTrajectoryAnalysis(player) {
  const baseCounterfactual = generateCounterfactual(player);
  const policyActual = generatePolicyProjection(player, state.policySimulationSettings);
  const policyCounterfactual = generateCounterfactual(player, state.policySimulationSettings);
  const baseGap = totalStructuralGap(player, baseCounterfactual);
  const policyGap = totalStructuralGap(policyActual, policyCounterfactual);
  const activePolicies = Object.values(state.policySimulationSettings).filter(Boolean).length;
  return `
    <section class="analysis-panel" aria-label="Life trajectory analysis">
      <div class="analysis-head">
        <div>
          <p class="eyebrow">Forensic Outcome Analysis</p>
          <h2>Life Trajectory Analysis: ${escapeHtml(player.publicLabel)}</h2>
          <p>
            This audit preserves visible qualifications and decisions, then isolates how hidden
            institutional assumptions changed the life-course trajectory.
          </p>
        </div>
        <button class="icon-button analysis-close" data-analysis-close aria-label="Close analysis">×</button>
      </div>

      <div class="analysis-toolbar">
        <button class="primary-button" data-compare-counterfactual>Compare with equivalent alternate path</button>
        <span class="status-pill">Actual: ${escapeHtml(readableHiddenPath(player))}</span>
        <span class="status-pill">Alternate: ${escapeHtml(readableHiddenPath(baseCounterfactual))}</span>
      </div>

      <div class="split-comparison">
        ${renderPathSummary("Actual path", player)}
        ${renderPathSummary("Equivalent alternate path", baseCounterfactual)}
      </div>

      <article class="audit-card">
        <div class="audit-card-head">
          <div>
            <p class="eyebrow">Animated divergence graph</p>
            <h3>Same decisions, different institutional treatment</h3>
          </div>
          <strong>${eur(baseGap, { compact: true })} lifetime earnings gap</strong>
        </div>
        ${divergenceGraph(player, baseCounterfactual)}
      </article>

      <div class="analysis-grid">
        <article class="audit-card">
          <p class="eyebrow">Timeline replay</p>
          <h3>Decision and outcome chronology</h3>
          ${renderTimeline(player)}
        </article>

        <article class="audit-card">
          <p class="eyebrow">Major divergence points</p>
          <h3>Where trajectories separated</h3>
          ${renderDivergenceMoments(player, baseCounterfactual)}
        </article>
      </div>

      <div class="analysis-grid">
        <article class="audit-card">
          <p class="eyebrow">Where did the gap come from?</p>
          <h3>Total difference: ${eur(baseGap, { compact: true })}</h3>
          ${renderForensicBreakdown(player, baseCounterfactual)}
        </article>

        <article class="audit-card">
          <p class="eyebrow">Cohort positioning</p>
          <h3>Relative location inside the cohort</h3>
          ${renderCohortPositioning(player)}
        </article>
      </div>

      <article class="audit-card">
        <div class="audit-card-head">
          <div>
            <p class="eyebrow">Policy experiment</p>
            <h3>Institutional design toggles</h3>
          </div>
          <strong>${activePolicies ? `${activePolicies} active` : "No intervention"}</strong>
        </div>
        ${renderPolicyToggles()}
        <div class="policy-impact">
          <div>
            <span>Without selected policy design</span>
            <strong>${eur(baseGap, { compact: true })}</strong>
          </div>
          <div>
            <span>With selected policy design</span>
            <strong>${eur(policyGap, { compact: true })}</strong>
          </div>
          <div>
            <span>Projected gap change</span>
            <strong>${eur(baseGap - policyGap, { compact: true })}</strong>
          </div>
        </div>
        ${divergenceGraph(policyActual, policyCounterfactual, "policy")}
      </article>
    </section>
  `;
}

function renderPathSummary(label, player) {
  return `
    <article class="path-card">
      <p class="eyebrow">${label}</p>
      <h3>${escapeHtml(player.publicLabel)}</h3>
      <div class="mini-metric-grid">
        ${metric("Lifetime earnings", eur(player.lifetimeEarnings, { compact: true }))}
        ${metric("Pension", eur(player.pension, { compact: true }))}
        ${metric("Stress", `${Math.round(player.stress)}/100`)}
        ${metric("Care hours", number(player.careHours))}
        ${metric("Promotions", player.promotionCount)}
        ${metric("Career level", player.careerLevel)}
      </div>
    </article>
  `;
}

function renderTimeline(player) {
  return `
    <div class="timeline">
      ${player.auditTrail
        .map((event, index) => {
          const expanded = state.selectedTimelineEvent === index;
          return `
            <article class="timeline-item ${expanded ? "is-expanded" : ""}">
              <button class="timeline-button" data-timeline-index="${index}">
                <span>Age ${event.age}</span>
                <strong>${escapeHtml(event.roundName)}</strong>
                <em>${escapeHtml(event.choiceTitle)}</em>
              </button>
              ${
                expanded
                  ? `<div class="timeline-detail">
                      <p>${escapeHtml(event.visibleEffect)}</p>
                      <p>${escapeHtml(event.institutionalEffect)}</p>
                      <div class="timeline-deltas">
                        ${event.deltas
                          .filter((item) => Math.abs(item.value) > 0.4)
                          .slice(0, 4)
                          .map(
                            (item) => `
                              <span>
                                ${item.label}
                                <strong>${item.value >= 0 ? "+" : ""}${item.formatter(item.value)}</strong>
                              </span>
                            `,
                          )
                          .join("")}
                      </div>
                      <small>${escapeHtml(event.researchConnection)}</small>
                    </div>`
                  : ""
              }
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderDivergenceMoments(actual, counterfactual) {
  const moments = detectDivergenceMoments(actual, counterfactual);
  return `
    <div class="divergence-list">
      ${moments
        .map(
          (moment) => `
            <div class="divergence-item">
              <span>Age ${moment.age}</span>
              <strong>${escapeHtml(moment.label)}</strong>
              <p>${escapeHtml(moment.reason)}</p>
              <small>${escapeHtml(moment.choice)} · gap acceleration ${eur(moment.acceleration, { compact: true })}</small>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderForensicBreakdown(actual, counterfactual) {
  const entries = contributionBreakdown(actual, counterfactual);
  const total = entries.reduce((sum, entry) => sum + entry[1], 0) || 1;
  return `
    <div class="waterfall">
      ${entries
        .map(
          ([label, value]) => `
            <div class="waterfall-row">
              <div>
                <span>${escapeHtml(label)}</span>
                <strong>${eur(value, { compact: true })}</strong>
              </div>
              <div class="bar"><span style="width: ${clamp((value / total) * 100, 4, 100)}%"></span></div>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderCohortPositioning(player) {
  const samePath = (candidate) => candidate.hiddenProfile.genderPath === player.hiddenProfile.genderPath;
  const alternatePath = (candidate) => candidate.hiddenProfile.genderPath !== player.hiddenProfile.genderPath;
  return `
    <div class="positioning-grid">
      ${metric("Earnings within same path", `${percentileRank(state.players, player, "lifetimeEarnings", samePath)}th percentile`)}
      ${metric("Earnings vs alternate path", `${percentileRank(state.players, player, "lifetimeEarnings", alternatePath)}th percentile`)}
      ${metric("Care burden", `${percentileRank(state.players, player, "careHours", () => true, true)}th percentile`)}
      ${metric("Pension", `${percentileRank(state.players, player, "pension")}th percentile`)}
      ${metric("Stress", `${percentileRank(state.players, player, "stress", () => true, true)}th percentile`)}
      ${metric("Promotion frequency", `${percentileRank(state.players, player, "promotionCount")}th percentile`)}
    </div>
  `;
}

function renderPolicyToggles() {
  return `
    <div class="policy-grid">
      ${policyDefinitions
        .map(
          (policy) => `
            <label class="policy-toggle">
              <input
                type="checkbox"
                data-policy-toggle="${policy.id}"
                ${state.policySimulationSettings[policy.id] ? "checked" : ""}
              />
              <span>
                <strong>${policy.label}</strong>
                ${policy.effect}
              </span>
            </label>
          `,
        )
        .join("")}
    </div>
  `;
}

function divergenceGraph(actual, counterfactual, variant = "base") {
  const width = 920;
  const height = 270;
  const pad = 38;
  const histories = [actual.history, counterfactual.history];
  const values = histories.flatMap((history) => history.map((point) => point.lifetimeEarnings || 0));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const makePath = (history) =>
    history
      .map((point, index) => {
        const x = pad + (index / Math.max(1, history.length - 1)) * (width - pad * 2);
        const y = height - pad - (((point.lifetimeEarnings || 0) - min) / range) * (height - pad * 2);
        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  const markers = actual.auditTrail
    .map((event, index) => {
      if (!["family", "part-time", "promotion", "care"].includes(event.roundId)) return "";
      const x = pad + ((index + 1) / Math.max(1, actual.history.length - 1)) * (width - pad * 2);
      return `
        <g>
          <line x1="${x}" y1="${pad}" x2="${x}" y2="${height - pad}" stroke="rgba(248,250,252,.16)" stroke-dasharray="4 6" />
          <text x="${x + 6}" y="${pad + 16}" fill="#CBD5E1" font-size="12">${event.roundName}</text>
        </g>
      `;
    })
    .join("");
  const id = `graph-${variant}`;
  return `
    <div class="divergence-graph" aria-label="Actual and counterfactual lifetime earnings divergence">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${id}">
        <title id="${id}">Trajectory divergence over time</title>
        <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" stroke="rgba(248,250,252,.2)" />
        <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${height - pad}" stroke="rgba(248,250,252,.2)" />
        ${markers}
        <path class="actual-line" d="${makePath(actual.history)}" />
        <path class="counter-line" d="${makePath(counterfactual.history)}" />
      </svg>
      <div class="chart-legend">
        <span><i class="actual-dot"></i>Actual path</span>
        <span><i class="counter-dot"></i>Equivalent alternate path</span>
      </div>
    </div>
  `;
}

function renderBreakdown(player) {
  const entries = [
    ["Negotiation penalty", player.effects.negotiation],
    ["Motherhood and availability assumptions", player.effects.motherhood],
    ["Missed promotion compounding", player.effects.promotions],
    ["Part-time and career interruption effects", player.effects.partTime],
    ["Unpaid care accumulation", player.effects.care],
    ["Pension contribution gap", player.effects.pension],
  ];
  const max = Math.max(...entries.map((entry) => entry[1]), 1);
  return `
    <div class="breakdown-list">
      ${entries
        .map(
          ([label, value]) => `
            <div class="breakdown-item">
              <div class="outcome-row" style="border: 0; padding: 0;">
                <span>${label}</span>
                <strong>${eur(value, { compact: true })}</strong>
              </div>
              <div class="bar"><span style="width: ${clamp((value / max) * 100, 4, 100)}%"></span></div>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function readableHiddenPath(player) {
  return player.hiddenProfile.genderPath === "feminine-coded"
    ? "F-coded"
    : "M-coded";
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2) return sorted[middle] || 0;
  return ((sorted[middle - 1] || 0) + (sorted[middle] || 0)) / 2;
}

function renderCohortSummary() {
  const feminine = state.players.filter((player) => player.hiddenProfile.genderPath === "feminine-coded");
  const masculine = state.players.filter((player) => player.hiddenProfile.genderPath === "masculine-coded");
  const feminineEarnings = median(feminine.map((player) => player.lifetimeEarnings));
  const masculineEarnings = median(masculine.map((player) => player.lifetimeEarnings));
  const feminineCare = median(feminine.map((player) => player.careHours));
  const masculineCare = median(masculine.map((player) => player.careHours));
  return `
    <div class="metric-grid" style="margin: 18px 0 22px;">
      ${metric("Median earnings / feminine-coded", eur(feminineEarnings, { compact: true }))}
      ${metric("Median earnings / masculine-coded", eur(masculineEarnings, { compact: true }))}
      ${metric("Median care hours / feminine-coded", number(feminineCare))}
      ${metric("Median care hours / masculine-coded", number(masculineCare))}
    </div>
  `;
}

function renderResearch() {
  app.innerHTML = `
    <section class="view">
      <p class="eyebrow">Research layer</p>
      <h2>Gameplay outcomes connected to evidence</h2>
      <p class="lead">
        These cards are intended for the post-game classroom discussion, after the hidden model has been revealed.
      </p>
      <div class="research-grid">
        ${researchCards
          .map(
            (card) => `
              <article class="research-card">
                <div>
                  <h3>${card.title}</h3>
                  <p>${card.text}</p>
                </div>
                <a href="${card.url}" target="_blank" rel="noreferrer">${card.source}</a>
              </article>
            `,
          )
          .join("")}
      </div>
      <div class="card" style="margin-top: 22px;">
        <h3>Discussion prompts</h3>
        <p class="compact-note">
          Did the system initially feel fair? Which decisions felt constrained?
          When did inequality become noticeable? Were outcomes caused by personal choices,
          institutional structures, or both?
        </p>
      </div>
    </section>
  `;
  bindPageActions();
}

function renderAbout() {
  app.innerHTML = `
    <section class="view setup-grid">
      <div>
        <p class="eyebrow">About project</p>
        <h2>A neutral interface with unequal outcomes</h2>
        <p class="lead">
          The prototype translates the technical game design document into a playable web experience:
          a board-game companion, QR-ready classroom activity, and hidden inequality simulation.
        </p>
        <div class="hero-actions">
          <button class="primary-button" data-action="join">Start prototype</button>
          <button class="ghost-button" data-action="research">View research</button>
        </div>
      </div>
      <div class="card">
        <h3>Design principle</h3>
        <p class="compact-note">
          The experience should not feel like a moralized lecture. It should feel like a seemingly
          objective system producing unequal outcomes through accumulation, incentives, norms,
          and invisible institutional assumptions.
        </p>
      </div>
    </section>
  `;
  bindPageActions();
}

function trait(label, value) {
  return `<div class="trait"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function metric(label, value) {
  const node = metricTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector(".metric-label").textContent = label;
  node.querySelector(".metric-value").textContent = value;
  return node.outerHTML;
}

function lineChart(history, keys) {
  const width = 420;
  const height = 180;
  const pad = 22;
  const values = history.flatMap((point) => keys.map((key) => point[key] || 0));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const colors = {
    salary: "#1F3A5F",
    pension: "#B85C8E",
  };
  const paths = keys
    .map((key) => {
      const points = history
        .map((point, index) => {
          const x = pad + (index / Math.max(1, history.length - 1)) * (width - pad * 2);
          const y = height - pad - (((point[key] || 0) - min) / range) * (height - pad * 2);
          return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(" ");
      return `<path d="${points}" fill="none" stroke="${colors[key]}" stroke-width="3" stroke-linecap="round" />`;
    })
    .join("");
  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Trajectory chart">
      <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" stroke="#D8D6CF" />
      <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${height - pad}" stroke="#D8D6CF" />
      ${paths}
    </svg>
  `;
}

function bindPageActions() {
  document.querySelectorAll("[data-action]").forEach((element) => {
    if (element.dataset.bound === "true") return;
    element.dataset.bound = "true";
    element.addEventListener("click", (event) => {
      event.preventDefault();
      const action = element.dataset.action;
      if (action === "home") state.screen = "landing";
      if (action === "join") {
  state.mode = "join";
  state.screen = "setup";
}

if (action === "host") {
  state.mode = "host";
  state.screen = "host-setup";
}
      // if (action === "setup") state.screen = "setup";
      if (action === "intro") state.screen = "intro";
      if (action === "start-rounds") state.screen = "round";
      if (action === "next-round") return nextRound();
      if (action === "research") state.screen = "research";
      if (action === "about") state.screen = "about";
      if (action === "reset") {
        state.screen = "landing";
        state.playerName = "";
        state.participantCount = 20;
        state.roomCode = generateRoomCode();
        state.roundIndex = 0;
        state.outcome = null;
        state.players = [];
        state.selectedAnalysisPlayer = null;
        state.counterfactualPlayer = null;
        state.selectedTimelineEvent = null;
        state.policySimulationSettings = {
          salaryTransparency: false,
          universalChildcare: false,
          equalParentalLeave: false,
          leadershipDiversityQuotas: false,
          subsidizedElderCare: false,
        };
      }
      render();
    });
  });
}

function bindAnalysisInteractions() {
  document.querySelectorAll("[data-analysis-player]").forEach((row) => {
    const openAnalysis = () => {
      state.selectedAnalysisPlayer = row.dataset.analysisPlayer;
      const player = state.players.find((candidate) => candidate.id === state.selectedAnalysisPlayer);
      state.counterfactualPlayer = player ? generateCounterfactual(player) : null;
      state.selectedTimelineEvent = 0;
      render();
    };
    row.addEventListener("click", openAnalysis);
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openAnalysis();
      }
    });
  });

  document.querySelectorAll("[data-analysis-close]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedAnalysisPlayer = null;
      state.counterfactualPlayer = null;
      state.selectedTimelineEvent = null;
      render();
    });
  });

  document.querySelectorAll("[data-timeline-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.timelineIndex);
      state.selectedTimelineEvent = state.selectedTimelineEvent === index ? null : index;
      render();
    });
  });

  document.querySelectorAll("[data-policy-toggle]").forEach((input) => {
    input.addEventListener("change", () => {
      state.policySimulationSettings[input.dataset.policyToggle] = input.checked;
      render();
    });
  });

  document.querySelectorAll("[data-compare-counterfactual]").forEach((button) => {
    button.addEventListener("click", () => {
      state.comparisonMode = "actual-vs-counterfactual";
      const graph = document.querySelector(".divergence-graph");
      if (graph) graph.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
}

function animateHeroChart() {
  const canvas = document.querySelector("#heroChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  const pad = 34;
  let start = null;

  function draw(timestamp) {
    if (!start) start = timestamp;
    const t = ((timestamp - start) % 7000) / 7000;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "#D8D6CF";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i += 1) {
      const y = pad + (i / 4) * (height - pad * 2);
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(width - pad, y);
      ctx.stroke();
    }
    drawLine("#1F3A5F", 0.42, 0.08 + t * 0.14);
    drawLine("#B85C8E", 0.42, 0.04 - t * 0.09);
    drawLine("#E58B7B", 0.42, 0.01 - t * 0.16);
    requestAnimationFrame(draw);
  }

  function drawLine(color, base, slope) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 44; i += 1) {
      const p = i / 44;
      const x = pad + p * (width - pad * 2);
      const wave = Math.sin(p * Math.PI * 2) * 0.018;
      const y = height - pad - (base + slope * p + wave) * (height - pad * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  requestAnimationFrame(draw);
}

if (joinRoomCode) {
  state.screen = "setup";
  state.mode = "join";
}
render(); 
supabase
  .channel("room-updates")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "players",
    },
    payload => {
      console.log("REALTIME UPDATE");
      console.log(payload);

      loadPlayers();
    }
  )
  .subscribe();
async function testConnection() {
  const { data, error } =
    await supabase
      .from("players")
      .select("*");

  console.log(data);
  console.log(error);
}

testConnection();
