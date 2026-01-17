# Native Bottom Sheets - Guida all'Uso

Questa guida spiega come utilizzare i nuovi componenti bottom sheet nativi nell'app Couple Diary.

## 📦 Componenti Disponibili

### 1. **NativeBottomSheet**
Bottom sheet generico e riutilizzabile con supporto per titolo, subtitle e contenuto personalizzato.

### 2. **ActionSheet**
Lista di azioni in stile iOS UIActionSheet / Android Bottom Sheet.

### 3. **MoodPickerSheet**
Selettore di mood con grid di emoji.

### 4. **PhotoPickerSheet**
Action sheet per scegliere foto (camera o galleria).

### 5. **SpecialDatePickerSheet**
Selettore di date speciali con suggerimenti rapidi e date picker nativo.

---

## 🚀 Installazione

I componenti utilizzano `@gorhom/bottom-sheet` per animazioni e gesture native:

```bash
npm install @gorhom/bottom-sheet
```

**Nota:** Il GestureHandlerRootView è già configurato in `app/_layout.tsx`.

---

## 📖 Esempi di Utilizzo

### 1. NativeBottomSheet (Generico)

```tsx
import { useRef } from 'react';
import { Button, Text } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { NativeBottomSheet } from '../components/ui/NativeBottomSheet';

function MyComponent() {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleOpen = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  const handleClose = () => {
    bottomSheetRef.current?.close();
  };

  return (
    <>
      <Button title="Apri Sheet" onPress={handleOpen} />

      <NativeBottomSheet
        ref={bottomSheetRef}
        title="Titolo del Sheet"
        subtitle="Sottotitolo opzionale"
        snapPoints={['50%', '90%']}
        onClose={handleClose}
      >
        <Text>Contenuto personalizzato qui</Text>
      </NativeBottomSheet>
    </>
  );
}
```

### 2. ActionSheet (Lista Azioni)

```tsx
import { useRef } from 'react';
import { Button } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { ActionSheet } from '../components/ui/ActionSheet';

function MyComponent() {
  const actionSheetRef = useRef<BottomSheet>(null);

  const handleOpen = () => {
    actionSheetRef.current?.snapToIndex(0);
  };

  const options = [
    {
      label: 'Modifica',
      icon: 'edit',
      onPress: () => console.log('Modifica'),
    },
    {
      label: 'Condividi',
      icon: 'share',
      onPress: () => console.log('Condividi'),
    },
    {
      label: 'Elimina',
      icon: 'delete',
      variant: 'destructive' as const,
      onPress: () => console.log('Elimina'),
    },
    {
      label: 'Annulla',
      variant: 'cancel' as const,
      onPress: () => actionSheetRef.current?.close(),
    },
  ];

  return (
    <>
      <Button title="Mostra Azioni" onPress={handleOpen} />

      <ActionSheet
        ref={actionSheetRef}
        title="Seleziona un'azione"
        options={options}
      />
    </>
  );
}
```

### 3. MoodPickerSheet

```tsx
import { useState, useRef } from 'react';
import { Button, Text } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { MoodPickerSheet } from '../components/ui/MoodPickerSheet';
import type { Mood } from '../types';

function MyComponent() {
  const [mood, setMood] = useState<Mood | null>(null);
  const moodSheetRef = useRef<BottomSheet>(null);

  const handleMoodSelect = (selectedMood: Mood | null) => {
    setMood(selectedMood);
    // Opzionale: chiudi automaticamente
    // moodSheetRef.current?.close();
  };

  return (
    <>
      <Button
        title={mood ? `Mood: ${mood}` : 'Seleziona Mood'}
        onPress={() => moodSheetRef.current?.snapToIndex(0)}
      />

      <MoodPickerSheet
        ref={moodSheetRef}
        selectedMood={mood}
        onSelect={handleMoodSelect}
      />
    </>
  );
}
```

### 4. PhotoPickerSheet

```tsx
import { useState, useRef } from 'react';
import { Button, Image } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { PhotoPickerSheet } from '../components/ui/PhotoPickerSheet';

function MyComponent() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const photoSheetRef = useRef<BottomSheet>(null);

  const handlePhotoSelected = (uri: string) => {
    setPhotoUri(uri);
    photoSheetRef.current?.close();
  };

  return (
    <>
      <Button
        title="Aggiungi Foto"
        onPress={() => photoSheetRef.current?.snapToIndex(0)}
      />

      {photoUri && <Image source={{ uri: photoUri }} style={{ width: 200, height: 200 }} />}

      <PhotoPickerSheet
        ref={photoSheetRef}
        onPhotoSelected={handlePhotoSelected}
      />
    </>
  );
}
```

### 5. SpecialDatePickerSheet

```tsx
import { useState, useRef } from 'react';
import { Button, Text } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { SpecialDatePickerSheet } from '../components/ui/SpecialDatePickerSheet';

function MyComponent() {
  const [specialDate, setSpecialDate] = useState<Date | null>(null);
  const dateSheetRef = useRef<BottomSheet>(null);

  const handleDateSelect = (date: Date) => {
    setSpecialDate(date);
    dateSheetRef.current?.close();
  };

  return (
    <>
      <Button
        title={specialDate ? `Data: ${specialDate.toLocaleDateString('it-IT')}` : 'Seleziona Data'}
        onPress={() => dateSheetRef.current?.snapToIndex(0)}
      />

      <SpecialDatePickerSheet
        ref={dateSheetRef}
        initialDate={specialDate || undefined}
        onDateSelected={handleDateSelect}
      />
    </>
  );
}
```

---

## 🎨 Props Comuni

### NativeBottomSheet

| Prop | Tipo | Default | Descrizione |
|------|------|---------|-------------|
| `children` | `ReactNode` | **Required** | Contenuto del sheet |
| `title` | `string` | - | Titolo mostrato nell'header |
| `subtitle` | `string` | - | Sottotitolo sotto il titolo |
| `showCloseButton` | `boolean` | `true` | Mostra bottone chiudi |
| `onClose` | `() => void` | - | Callback quando il sheet si chiude |
| `snapPoints` | `(string\|number)[]` | `['50%', '90%']` | Altezze di snap |
| `initialSnapIndex` | `number` | `0` | Indice iniziale di snap |
| `enableDynamicSizing` | `boolean` | `false` | Dimensionamento dinamico basato sul contenuto |
| `backgroundStyle` | `'default'\|'transparent'` | `'default'` | Stile dello sfondo |
| `enablePanDownToClose` | `boolean` | `true` | Abilita gesture di chiusura |

### ActionSheet

| Prop | Tipo | Default | Descrizione |
|------|------|---------|-------------|
| `title` | `string` | - | Titolo dell'action sheet |
| `message` | `string` | - | Messaggio/descrizione |
| `options` | `ActionSheetOption[]` | **Required** | Lista di opzioni |
| `onClose` | `() => void` | - | Callback quando il sheet si chiude |

### ActionSheetOption

```typescript
interface ActionSheetOption {
  label: string;                          // Etichetta dell'opzione
  icon?: string;                          // Nome icona Material Icons
  onPress: () => void;                    // Azione da eseguire
  variant?: 'default' | 'destructive' | 'cancel';  // Stile
  disabled?: boolean;                     // Disabilita opzione
}
```

---

## 🎯 Best Practices

### 1. **Gestione Ref**
Usa sempre `useRef<BottomSheet>(null)` per controllare il sheet:

```tsx
const sheetRef = useRef<BottomSheet>(null);

// Apri
sheetRef.current?.snapToIndex(0);

// Chiudi
sheetRef.current?.close();
```

### 2. **Snap Points**
- Usa percentuali per altezze responsive: `['40%', '75%']`
- Usa `'CONTENT_HEIGHT'` o `enableDynamicSizing` per altezza dinamica
- Per ActionSheet, usa sempre `enableDynamicSizing`

### 3. **Auto-close su Selezione**
Per sheet di selezione (mood, foto), chiudi automaticamente:

```tsx
const handleSelect = (value: any) => {
  setValue(value);
  sheetRef.current?.close();
};
```

### 4. **Dark Mode**
Tutti i componenti supportano il dark mode automaticamente usando `useTheme()`.

### 5. **Gesture Native**
- Swipe down per chiudere (se `enablePanDownToClose={true}`)
- Tap sul backdrop per chiudere
- Over-scroll gesture su iOS

---

## 🔧 Integrazione con Entry Creation

Esempio completo di integrazione nel form di creazione entry:

```tsx
import { useState, useRef } from 'react';
import { ScrollView, TextInput, Button, View } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { MoodPickerSheet } from '../components/ui/MoodPickerSheet';
import { PhotoPickerSheet } from '../components/ui/PhotoPickerSheet';
import { SpecialDatePickerSheet } from '../components/ui/SpecialDatePickerSheet';
import type { Mood } from '../types';

function NewEntryScreen() {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isSpecial, setIsSpecial] = useState(false);
  const [specialDate, setSpecialDate] = useState<Date | null>(null);

  const moodSheetRef = useRef<BottomSheet>(null);
  const photoSheetRef = useRef<BottomSheet>(null);
  const dateSheetRef = useRef<BottomSheet>(null);

  const handleSubmit = async () => {
    // Crea entry con mood, foto, data speciale
    console.log({ content, mood, photoUri, isSpecial, specialDate });
  };

  return (
    <ScrollView>
      <TextInput
        placeholder="Come ti senti oggi?"
        value={content}
        onChangeText={setContent}
        multiline
      />

      <Button
        title={mood ? `Mood: ${mood}` : 'Aggiungi Mood'}
        onPress={() => moodSheetRef.current?.snapToIndex(0)}
      />

      <Button
        title="Aggiungi Foto"
        onPress={() => photoSheetRef.current?.snapToIndex(0)}
      />

      <Button
        title="Data Speciale"
        onPress={() => dateSheetRef.current?.snapToIndex(0)}
      />

      <Button title="Pubblica" onPress={handleSubmit} />

      {/* Bottom Sheets */}
      <MoodPickerSheet
        ref={moodSheetRef}
        selectedMood={mood}
        onSelect={setMood}
      />

      <PhotoPickerSheet
        ref={photoSheetRef}
        onPhotoSelected={(uri) => {
          setPhotoUri(uri);
          photoSheetRef.current?.close();
        }}
      />

      <SpecialDatePickerSheet
        ref={dateSheetRef}
        onDateSelected={(date) => {
          setSpecialDate(date);
          setIsSpecial(true);
          dateSheetRef.current?.close();
        }}
      />
    </ScrollView>
  );
}
```

---

## 🐛 Troubleshooting

### Sheet non si apre
- Verifica che `GestureHandlerRootView` sia wrappato intorno all'app
- Controlla che il ref sia correttamente assegnato

### Animazioni non fluide
- Assicurati che react-native-reanimated sia configurato in `babel.config.js`
- Usa `enableDynamicSizing` solo quando necessario (impatto performance)

### Dark mode non funziona
- I componenti usano `useTheme()` che dipende da `useColorScheme()`
- Verifica che il ThemeProvider sia configurato

---

## 📚 Risorse

- [Gorhom Bottom Sheet Docs](https://gorhom.github.io/react-native-bottom-sheet/)
- [iOS Human Interface Guidelines - Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)
- [Material Design - Bottom Sheets](https://m3.material.io/components/bottom-sheets/overview)

---

## 🎉 Conclusione

I bottom sheet nativi migliorano l'UX dell'app rendendola più familiare e intuitiva per gli utenti iOS e Android. Usa questi componenti per:

- Selezioni (mood, foto, date)
- Azioni contestuali (modifica, elimina, condividi)
- Form secondari
- Conferme e alert

Happy coding! 🚀
