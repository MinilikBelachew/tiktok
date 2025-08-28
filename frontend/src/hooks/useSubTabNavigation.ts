import { useState } from 'react';

interface UseSubTabNavigationOptions<T extends string> {
  initialTab: T;
  components: Record<T, React.ReactElement>;
}

export function useSubTabNavigation<T extends string>({ 
  initialTab, 
  components 
}: UseSubTabNavigationOptions<T>) {
  const [activeSubTab, setActiveSubTab] = useState<T>(initialTab);

  const handleSubTabChange = (subTab: string) => {
    setActiveSubTab(subTab as T);
  };

  const renderActiveComponent = () => {
    return components[activeSubTab];
  };

  return {
    activeSubTab,
    handleSubTabChange,
    renderActiveComponent
  };
}
