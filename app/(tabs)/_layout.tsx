import { MaterialIcons } from '@expo/vector-icons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import { Colors } from '../../constants/theme';

export default function TabLayout() {
  return (
    <NativeTabs tintColor={Colors.primary.DEFAULT}>
      <NativeTabs.Trigger name="index">
        <Label>Diario</Label>
        <Icon
          sf="pencil"
          androidSrc={<VectorIcon family={MaterialIcons} name="edit" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="calendar">
        <Label>Ricordi</Label>
        <Icon
          sf="calendar"
          androidSrc={<VectorIcon family={MaterialIcons} name="calendar-today" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="insight">
        <Label>Insight</Label>
        <Icon
          sf="chart.bar.fill"
          androidSrc={<VectorIcon family={MaterialIcons} name="bar-chart" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Label>Profilo</Label>
        <Icon
          sf="person.fill"
          androidSrc={<VectorIcon family={MaterialIcons} name="person" />}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
