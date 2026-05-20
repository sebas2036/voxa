import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, TextInput } from 'react-native'

const EMOJI_CATEGORIES = [
  { label: '😀', name: 'caras',      emojis: ['😀','😂','🥹','😍','🤩','😎','🤔','😤','😭','😱','🥳','😴','🤗','😏','🙄','😬','🤯','🥺','😇','🤭','😋','🤑','😅','🫠','🤫','😌','😜','🤪','😈','👻'] },
  { label: '❤️', name: 'corazones',  emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💕','💞','💓','💗','💖','💘','💝','♥️','❣️','💔','🫀','❤️‍🔥','❤️‍🩹','💟','☮️','✌️','🤞','🫶','👏','🙌','🤜','🤛'] },
  { label: '🔥', name: 'popular',    emojis: ['🔥','✨','💫','⭐','🌟','💥','🎯','🚀','💡','🎉','🎊','🏆','👑','💎','🌈','⚡','🌊','🌸','🍀','🦋','🌙','☀️','🌺','🎨','🎭','🎬','🎵','🎶','🏅','🥇'] },
  { label: '🌿', name: 'naturaleza', emojis: ['🌿','🌱','🌲','🌳','🍃','🌾','🌻','🌹','🌸','🌺','🌼','🌷','🍁','🍂','🍄','🌵','🎋','🎍','🌴','🪴','🌊','🌅','🌄','🌠','⛅','🌤','🌧','❄️','🌊','🏔'] },
  { label: '💼', name: 'trabajo',    emojis: ['💼','📱','💻','🖥','📊','📈','📉','🗂','📋','📌','📍','✅','☑️','🔑','💡','🎯','🚀','⚡','🏆','🥇','💰','💳','🤝','👔','🎓','📝','✍️','🔍','📣','📢'] },
  { label: '🎭', name: 'expresión',  emojis: ['💪','🙏','👋','🤙','👍','👎','✌️','🤞','🫶','🤝','🫱','🫲','👌','🤌','🤏','☝️','👆','👇','👉','👈','🙌','👏','🫂','💃','🕺','🧘','🤸','⛹️','🏃','🚶'] },
]

export function EmojiPicker({ onSelect, theme, color }: { onSelect: (e: string) => void, theme: any, color: string }) {
  const [visible, setVisible] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)
  const [search, setSearch] = useState('')

  const filtered = search
    ? EMOJI_CATEGORIES.flatMap(c => c.emojis)
    : EMOJI_CATEGORIES[activeCategory].emojis

  return (
    <>
      <TouchableOpacity style={[s.trigger, { borderColor: color + '60', backgroundColor: color + '15' }]} onPress={() => setVisible(true)}>
        <Text style={[s.triggerText, { color }]}>＋</Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => { setVisible(false); setSearch('') }}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => { setVisible(false); setSearch('') }}>
          <TouchableOpacity activeOpacity={1} style={[s.sheet, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
            <View style={s.handle} />
            <TextInput
              style={[s.search, { backgroundColor: theme.bgTertiary, color: theme.text, borderColor: theme.border }]}
              placeholder="buscar emoji..." placeholderTextColor={theme.textDisabled}
              value={search} onChangeText={setSearch}
            />
            {!search && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.cats}>
                {EMOJI_CATEGORIES.map((cat, i) => (
                  <TouchableOpacity key={cat.name} onPress={() => setActiveCategory(i)}
                    style={[s.catBtn, activeCategory === i && { borderBottomColor: color, borderBottomWidth: 2 }]}>
                    <Text style={s.catEmoji}>{cat.label}</Text>
                    <Text style={[s.catName, { color: activeCategory === i ? color : theme.textMuted }]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <ScrollView style={s.grid} contentContainerStyle={s.gridContent}>
              <View style={s.gridWrap}>
                {filtered.map((emoji, idx) => (
                  <TouchableOpacity key={emoji + idx} style={s.emojiBtn}
                    onPress={() => { onSelect(emoji); setVisible(false); setSearch('') }}>
                    <Text style={s.emoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  )
}

const s = StyleSheet.create({
  trigger: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  triggerText: { fontSize: 18, lineHeight: 22 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, paddingTop: 12, paddingBottom: 40, maxHeight: '70%' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#555', alignSelf: 'center', marginBottom: 12 },
  search: { marginHorizontal: 16, marginBottom: 12, borderRadius: 10, padding: 10, fontSize: 14, borderWidth: 0.5 },
  cats: { marginBottom: 8, paddingHorizontal: 12 },
  catBtn: { paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', marginRight: 4 },
  catEmoji: { fontSize: 18 },
  catName: { fontSize: 9, letterSpacing: 0.5, marginTop: 2 },
  grid: { paddingHorizontal: 12 },
  gridContent: { paddingBottom: 20 },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  emojiBtn: { width: '14.28%', alignItems: 'center', paddingVertical: 8 },
  emoji: { fontSize: 26 },
})
