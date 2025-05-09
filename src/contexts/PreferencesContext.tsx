
import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserPreferences, ChartPreference } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface PreferencesContextType {
  preferences: UserPreferences;
  saveChartPreference: (preference: Omit<ChartPreference, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteChartPreference: (id: string) => void;
  setDefaultChart: (id: string | undefined) => void;
  toggleTheme: () => void;
  toggleViewMode: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  viewMode: 'grid',
  chartPreferences: [],
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const { toast } = useToast();

  // Initialize preferences from localStorage
  useEffect(() => {
    const storedPreferences = localStorage.getItem('userPreferences');
    
    if (storedPreferences) {
      try {
        const parsedPreferences = JSON.parse(storedPreferences);
        setPreferences(parsedPreferences);
        
        // Apply theme
        document.documentElement.classList.toggle('dark', parsedPreferences.theme === 'dark');
      } catch (error) {
        console.error('Failed to parse stored preferences:', error);
        localStorage.removeItem('userPreferences');
      }
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
  };

  // Toggle theme between light and dark
  const toggleTheme = () => {
    const newTheme = preferences.theme === 'light' ? 'dark' : 'light';
    
    // Update document class for immediate effect
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    savePreferences({
      ...preferences,
      theme: newTheme
    });
    
    toast({
      title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`,
      description: `Switched to ${newTheme} theme`,
    });
  };

  // Toggle view mode between grid and list
  const toggleViewMode = () => {
    const newViewMode = preferences.viewMode === 'grid' ? 'list' : 'grid';
    
    savePreferences({
      ...preferences,
      viewMode: newViewMode
    });
    
    toast({
      title: `View changed`,
      description: `Switched to ${newViewMode} view`,
    });
  };

  // Save a new chart preference
  const saveChartPreference = (preference: Omit<ChartPreference, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newPreference: ChartPreference = {
      ...preference,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: now,
      updatedAt: now
    };
    
    const updatedPreferences = {
      ...preferences,
      chartPreferences: [...preferences.chartPreferences, newPreference]
    };
    
    savePreferences(updatedPreferences);
    
    toast({
      title: 'Chart view saved',
      description: `"${preference.name}" has been saved to your preferences`,
    });
  };

  // Delete a chart preference
  const deleteChartPreference = (id: string) => {
    const updatedChartPreferences = preferences.chartPreferences.filter(p => p.id !== id);
    
    // Also clear default chart if it was the deleted one
    const updatedDefaultChart = preferences.defaultChartId === id 
      ? undefined
      : preferences.defaultChartId;
    
    const updatedPreferences = {
      ...preferences,
      chartPreferences: updatedChartPreferences,
      defaultChartId: updatedDefaultChart
    };
    
    savePreferences(updatedPreferences);
    
    toast({
      title: 'Chart view deleted',
      description: 'The chart view has been removed from your preferences',
    });
  };

  // Set default chart
  const setDefaultChart = (id: string | undefined) => {
    savePreferences({
      ...preferences,
      defaultChartId: id
    });
    
    if (id) {
      const chartName = preferences.chartPreferences.find(p => p.id === id)?.name;
      
      toast({
        title: 'Default chart set',
        description: `"${chartName}" is now your default chart view`,
      });
    } else {
      toast({
        title: 'Default chart cleared',
        description: 'No default chart view is set',
      });
    }
  };

  const contextValue: PreferencesContextType = {
    preferences,
    saveChartPreference,
    deleteChartPreference,
    setDefaultChart,
    toggleTheme,
    toggleViewMode
  };

  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
