import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import DashboardScreen from '../screens/DashboardScreen';
import PatientsScreen from '../screens/PatientsScreen';
import AddPatientScreen from '../screens/AddPatientScreen';
import PatientDetailScreen from '../screens/PatientDetailScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import AddAppointmentScreen from '../screens/AddAppointmentScreen';
import BillingScreen from '../screens/BillingScreen';
import AddBillScreen from '../screens/AddBillScreen';

import { Colors, Typography } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function PatientsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientsList" component={PatientsScreen} />
      <Stack.Screen name="AddPatient" component={AddPatientScreen} />
      <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
    </Stack.Navigator>
  );
}

function AppointmentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppointmentsList" component={AppointmentsScreen} />
      <Stack.Screen name="AddAppointment" component={AddAppointmentScreen} />
    </Stack.Navigator>
  );
}

function BillingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BillingList" component={BillingScreen} />
      <Stack.Screen name="AddBill" component={AddBillScreen} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, { active: any; inactive: any }> = {
            Dashboard: { active: 'grid', inactive: 'grid-outline' },
            Patients: { active: 'people', inactive: 'people-outline' },
            Appointments: { active: 'calendar', inactive: 'calendar-outline' },
            Billing: { active: 'receipt', inactive: 'receipt-outline' },
          };
          const icon = icons[route.name];
          return (
            <Ionicons
              name={focused ? icon.active : icon.inactive}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          ...Typography.caption,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: t('tabs.dashboard') }} />
      <Tab.Screen name="Patients" component={PatientsStack} options={{ title: t('tabs.patients') }} />
      <Tab.Screen name="Appointments" component={AppointmentsStack} options={{ title: t('tabs.appointments') }} />
      <Tab.Screen name="Billing" component={BillingStack} options={{ title: t('tabs.billing') }} />
    </Tab.Navigator>
  );
}

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={require('../screens/LoginScreen').default} />
      <Stack.Screen name="SignUp" component={require('../screens/SignUpScreen').default} />
    </Stack.Navigator>
  );
}
