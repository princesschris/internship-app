import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function useCustomAlert() {
  const [config, setConfig] = useState(null);

  const showAlert = ({ title, message, buttons = [{ text: 'OK' }] }) => {
    setConfig({ title, message, buttons });
  };

  const hide = () => setConfig(null);

  const AlertComponent = config ? (
    <Modal transparent visible animationType="fade" statusBarTranslucent onRequestClose={hide}>
      <View style={s.overlay}>
        <View style={s.card}>
          {/* Icon */}
          {(() => {
            const isDestructive = config.buttons.some(b => b.style === 'destructive');
            const isInfo = config.buttons.length === 1 && !isDestructive;
            const iconName = isDestructive ? 'warning-outline' : isInfo ? 'information-circle-outline' : 'help-circle-outline';
            const iconColor = isDestructive ? '#DC2626' : isInfo ? '#2563EB' : '#D97706';
            const iconBg = isDestructive ? '#FEF2F2' : isInfo ? '#EFF6FF' : '#FFFBEB';
            return (
              <View style={[s.iconWrap, { backgroundColor: iconBg }]}>
                <Ionicons name={iconName} size={28} color={iconColor} />
              </View>
            );
          })()}

          <Text style={s.title}>{config.title}</Text>
          {config.message ? <Text style={s.message}>{config.message}</Text> : null}

          <View style={[s.btnRow, config.buttons.length === 1 && s.btnRowSingle]}>
            {config.buttons.map((btn, i) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    s.btn,
                    config.buttons.length === 1 && s.btnFull,
                    isDestructive && s.btnDanger,
                    isCancel && s.btnCancel,
                    !isDestructive && !isCancel && s.btnPrimary,
                  ]}
                  onPress={() => { hide(); btn.onPress?.(); }}
                  activeOpacity={0.82}
                >
                  <Text style={[
                    s.btnText,
                    isDestructive && s.btnTextWhite,
                    isCancel && s.btnTextCancel,
                    !isDestructive && !isCancel && s.btnTextWhite,
                  ]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  ) : null;

  return { showAlert, AlertComponent };
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 14,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
  btnRowSingle: { flexDirection: 'column' },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnFull: { flex: undefined, width: '100%' },
  btnPrimary: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDanger: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnCancel: { backgroundColor: '#F1F5F9' },
  btnText: { fontSize: 15, fontWeight: '600' },
  btnTextWhite: { color: '#fff' },
  btnTextCancel: { color: '#64748B' },
});