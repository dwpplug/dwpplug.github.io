import { Beat } from '../types';

const STORAGE_KEY = 'neonflow_beats_v2';

// Initial Mock Data - Empty
const INITIAL_BEATS: Beat[] = [];

export const getBeats = (): Beat[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BEATS));
    return INITIAL_BEATS;
  }
  return JSON.parse(stored);
};

export const getBeatById = (id: string): Beat | undefined => {
  const beats = getBeats();
  return beats.find((b) => b.id === id);
};

export const addBeat = (beat: Beat): void => {
  const beats = getBeats();
  const newBeats = [beat, ...beats];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newBeats));
};

export const deleteBeat = (id: string): void => {
  const beats = getBeats();
  const newBeats = beats.filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newBeats));
};