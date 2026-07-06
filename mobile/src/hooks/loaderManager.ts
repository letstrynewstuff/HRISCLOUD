import { BantaHRLetterLoaderRef } from "../components/BantaHRLetterLoader";

let loaderRef: BantaHRLetterLoaderRef | null = null;

export const setLoaderRef = (ref: BantaHRLetterLoaderRef | null) => {
  loaderRef = ref;
};

export const Loader = {
  show: () => loaderRef?.show(),
  hide: () => loaderRef?.hide(),
};
