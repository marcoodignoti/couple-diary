import { MaterialIcons } from '@expo/vector-icons';
import { NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import { Colors } from '../../constants/theme';

export default function TabLayout() {
  return (
    <NativeTabs tintColor={Colors.primary.DEFAULT}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Diario</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="square.and.pencil"
          androidSrc={<VectorIcon family={MaterialIcons} name="edit" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="calendar">
        <NativeTabs.Trigger.Label>Ricordi</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="calendar"
          androidSrc={<VectorIcon family={MaterialIcons} name="calendar-today" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profilo</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="person.circle"
          androidSrc={<VectorIcon family={MaterialIcons} name="person" />}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
