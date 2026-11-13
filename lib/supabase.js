import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uotrkukemlpgvfobgbfd.supabase.co';
const supabasePublishableKey = 'sb_publishable_cjwNhkZ-GgOSU2p30UvCfQ_8MzxUc2y';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
