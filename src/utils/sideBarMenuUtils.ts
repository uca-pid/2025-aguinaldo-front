
export interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactElement;
  path: string;
  action?: () => void;
}
