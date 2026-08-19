import dark from './dark';
import rose from './rose';
import ocean from './ocean';
import sunset from './sunset';
import glass from './glass';

const themes = { dark, rose, ocean, sunset, glass };

export const getTheme = (name) => themes[name] || themes.dark;
export const getAllThemes = () => Object.values(themes);
export default themes;
