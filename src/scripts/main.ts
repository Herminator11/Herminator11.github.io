import { initTheme } from './theme';
import { initHeader } from './header';
import { initReveal } from './reveal';
import { initRail } from './rail';
import { initImages } from './images';
import { initFilter } from './filter';
import { initModal } from './modal';

// Isolated so one failing feature doesn't take down the rest.
for (const init of [initTheme, initHeader, initImages, initFilter, initModal, initReveal, initRail]) {
  try {
    init();
  } catch (err) {
    console.error(err);
  }
}
