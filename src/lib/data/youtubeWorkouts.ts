export interface YoutubeWorkout {
  id: string;
  title: string;
  duration: number; // in minutes
  channel: string;
  type: 'low_energy' | 'high_energy';
  tags: string[];
}

export const youtubeWorkouts: YoutubeWorkout[] = [
  // LOW ENERGY
  {
    id: 'v7AYKMP6rOE',
    title: 'Yoga For Menstrual Cramps',
    duration: 30,
    channel: 'Yoga With Adriene',
    type: 'low_energy',
    tags: ['Yoga', 'Menstrual', 'Gentle']
  },
  {
    id: 'sTANio_2E0Q',
    title: 'Yoga For Vulnerability',
    duration: 25,
    channel: 'Yoga With Adriene',
    type: 'low_energy',
    tags: ['Yoga', 'Stretching']
  },
  {
    id: 'b1H3xO3x_Js',
    title: '10 Minute Morning Yoga',
    duration: 10,
    channel: 'Yoga With Adriene',
    type: 'low_energy',
    tags: ['Yoga', 'Morning', 'Quick']
  },
  {
    id: 'g_tea8ZNk5A',
    title: '15 Min Full Body Stretch',
    duration: 15,
    channel: 'Emi Wong',
    type: 'low_energy',
    tags: ['Stretching', 'Relaxation']
  },
  {
    id: 'L_xrDAtykMI',
    title: '10 Min Pilates Core',
    duration: 10,
    channel: 'Lilly Sabri',
    type: 'low_energy',
    tags: ['Pilates', 'Core', 'Mat']
  },

  // HIGH ENERGY
  {
    id: '2MoGxae-zyo',
    title: '15 Mins Full Body HIIT',
    duration: 15,
    channel: 'Chloe Ting',
    type: 'high_energy',
    tags: ['HIIT', 'Full Body', 'Cardio']
  },
  {
    id: 'I9nG-G4B5Bs',
    title: '10 Mins Abs Workout',
    duration: 10,
    channel: 'Chloe Ting',
    type: 'high_energy',
    tags: ['Abs', 'Core', 'Strength']
  },
  {
    id: 'cbKkB3oaNGA',
    title: '15 Min Intense HIIT',
    duration: 15,
    channel: 'Pamela Reif',
    type: 'high_energy',
    tags: ['HIIT', 'Intense', 'Cardio']
  },
  {
    id: 'UBMk30rjy0o',
    title: '20 Min Full Body Workout',
    duration: 20,
    channel: 'Pamela Reif',
    type: 'high_energy',
    tags: ['Full Body', 'Strength', 'No Equipment']
  },
  {
    id: 'VzGzE_z9L38',
    title: '30 Min Boxing HIIT',
    duration: 30,
    channel: 'NateBowerFitness',
    type: 'high_energy',
    tags: ['Boxing', 'HIIT', 'Intense']
  }
];
