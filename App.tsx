import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Session } from '@supabase/supabase-js';

import { supabase } from './src/lib/supabase';
import './src/localization/i18n';
import { AppNavigator, AuthNavigator } from './src/navigation/AppNavigator';
import { Colors } from './src/theme';
import { getStoredLanguage } from './src/localization/i18n';
import i18n from './src/localization/i18n';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Restore saved language preference
    getStoredLanguage().then((lang) => i18n.changeLanguage(lang));

    // Auth state listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitializing(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session),
    );

    return () => subscription.unsubscribe();
  }, []);

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {session ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
