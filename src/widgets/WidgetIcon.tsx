import type { ComponentType } from 'react';
import type { IconProps } from '../components/icons';
import {
  BatteryIcon,
  BookmarkIcon,
  CalendarIcon,
  ChartIcon,
  ClockIcon,
  CloudIcon,
  ContactsIcon,
  DownloadIcon,
  FilmIcon,
  FlameIcon,
  GridIcon,
  LayersIcon,
  MailIcon,
  MusicIcon,
  NoteIcon,
  PlugIcon,
  SearchIcon,
  ShieldIcon,
  SparkIcon,
  TabsIcon,
  TaskIcon,
  TimerIcon,
  LinkIcon2,
  VolumeIcon,
  WifiIcon,
} from '../components/icons';
import type { WidgetIconName } from './catalogue';

const ICONS: Record<WidgetIconName, ComponentType<IconProps>> = {
  clock: ClockIcon,
  spark: SparkIcon,
  search: SearchIcon,
  task: TaskIcon,
  note: NoteIcon,
  timer: TimerIcon,
  calendar: CalendarIcon,
  habit: FlameIcon,
  chart: ChartIcon,
  board: GridIcon,
  music: MusicIcon,
  volume: VolumeIcon,
  cloud: CloudIcon,
  news: LayersIcon,
  bookmark: BookmarkIcon,
  tabs: TabsIcon,
  download: DownloadIcon,
  battery: BatteryIcon,
  wifi: WifiIcon,
  mail: MailIcon,
  contacts: ContactsIcon,
  link: LinkIcon2,
  grid: GridIcon,
  layers: LayersIcon,
  film: FilmIcon,
  shield: ShieldIcon,
};

export function WidgetGlyph({ name, size = 16 }: { name: WidgetIconName; size?: number }) {
  const Glyph = ICONS[name] ?? PlugIcon;
  return <Glyph size={size} />;
}
