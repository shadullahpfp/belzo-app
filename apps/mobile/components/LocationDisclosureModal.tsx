/**
 * LocationDisclosureModal
 *
 * Google Play Store POLICY REQUIREMENT:
 * Apps that access precise/approximate location must show a prominent in-app
 * disclosure *before* triggering the OS-level location permission prompt.
 * This component satisfies that requirement with the required disclosure text.
 *
 * Usage:
 *   <LocationDisclosureModal
 *     visible={showDisclosure}
 *     onAllow={() => { setShowDisclosure(false); requestLocation(); }}
 *     onDeny={() => setShowDisclosure(false)}
 *   />
 */
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MapPin, Shield } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

export function LocationDisclosureModal({ visible, onAllow, onDeny }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Icon */}
          <View style={styles.iconWrap}>
            <MapPin size={32} color="#FF5E00" />
          </View>

          <Text style={styles.title}>Location Access</Text>

          {/* MANDATORY disclosure text as required by Google Play policy */}
          <Text style={styles.body}>
            <Text style={styles.bold}>Belzo</Text> collects location data to find
            nearby dark stores and autofill your doorstep delivery address.{'\n\n'}
            Your location is used only while the app is in the foreground and is
            never shared with third parties.
          </Text>

          {/* Trust badge */}
          <View style={styles.trustRow}>
            <Shield size={13} color="#047857" />
            <Text style={styles.trustText}>
              Encrypted in transit · Not sold to advertisers
            </Text>
          </View>

          {/* Actions */}
          <TouchableOpacity onPress={onAllow} style={styles.allowBtn} activeOpacity={0.9}>
            <Text style={styles.allowBtnText}>Allow Location Access</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onDeny} style={styles.denyBtn} activeOpacity={0.8}>
            <Text style={styles.denyBtnText}>Not Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  bold: {
    fontWeight: '700',
    color: '#111827',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: '#BBF7D0',
  },
  trustText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
  },
  allowBtn: {
    width: '100%',
    backgroundColor: '#FF5E00',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#FF5E00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  allowBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  denyBtn: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  denyBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
});
