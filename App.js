import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView,
  ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const BLUE = '#2563EB';
const DARK = '#14264B';
const MUTED = '#718096';
const BG = '#F7F9FC';
const categories = [
  ['⌘','البرمجة','تعلم بناء التطبيقات والمواقع'],
  ['◈','الأمن السيبراني','افهم الحماية والأمان الرقمي'],
  ['✳','التصميم','ابدأ رحلتك في التصميم والإبداع'],
  ['✦','الذكاء الاصطناعي','اكتشف أدوات وتقنيات الذكاء الاصطناعي'],
  ['↗','التسويق الرقمي','تعلم التسويق وصناعة المحتوى'],
  ['◇','ريادة الأعمال','حوّل أفكارك إلى مشاريع'],
  ['文','اللغات','طوّر مهاراتك اللغوية'],
  ['▦','المهارات الرقمية','مهارات العالم الرقمي'],
  ['⌬','العلوم والهندسة','اكتشف العلوم والتقنيات'],
  ['▣','المهارات المهنية','استعد للدراسة والعمل']
];

const inputStyle = {
  backgroundColor:'#FFFFFF', borderWidth:1, borderColor:'#E2E8F0',
  borderRadius:14, paddingHorizontal:15, paddingVertical:14,
  color:DARK, fontSize:15, textAlign:'right', marginTop:8
};

function Brand({small=false}) {
  return <View style={{alignItems:'center',marginBottom:small?18:28}}>
    <View style={{width:66,height:66,borderRadius:22,backgroundColor:'#EAF1FF',alignItems:'center',justifyContent:'center',marginBottom:12}}>
      <Text style={{fontSize:35,fontWeight:'900',color:BLUE}}>ف</Text>
    </View>
    <Text style={{fontSize:small?27:32,fontWeight:'900',color:DARK}}>فرصتي</Text>
    <Text style={{fontSize:13,color:MUTED,marginTop:5}}>تعلّم اليوم، واصنع فرصتك غداً</Text>
  </View>;
}

function Field({label, value, onChangeText, placeholder, secure=false, keyboardType='default', autoCapitalize='sentences'}) {
  return <View style={{marginBottom:14}}>
    <Text style={{textAlign:'right',fontSize:13,fontWeight:'700',color:'#34445F'}}>{label}</Text>
    <TextInput
      value={value} onChangeText={onChangeText} placeholder={placeholder}
      placeholderTextColor="#A0AEC0" secureTextEntry={secure}
      keyboardType={keyboardType} autoCapitalize={autoCapitalize}
      autoCorrect={false} style={inputStyle}
    />
  </View>;
}

function ActionButton({title,onPress,secondary=false,disabled=false}) {
  return <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={disabled}
    style={{height:53,borderRadius:15,alignItems:'center',justifyContent:'center',
      backgroundColor:secondary?'#FFFFFF':BLUE,borderWidth:secondary?1:0,borderColor:'#D9E2F1',
      opacity:disabled?0.65:1,marginTop:10}}>
    <Text style={{fontSize:15,fontWeight:'800',color:secondary?DARK:'#FFFFFF'}}>{title}</Text>
  </TouchableOpacity>;
}

function AuthScreen({mode,setMode,onSuccess}) {
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [busy,setBusy]=useState(false);

  async function submit() {
    const cleanEmail=email.trim().toLowerCase();
    if (!cleanEmail || !password) return Alert.alert('بيانات ناقصة','أدخل البريد الإلكتروني وكلمة المرور.');
    if (mode==='signup' && !name.trim()) return Alert.alert('الاسم مطلوب','اكتب اسمك للمتابعة.');
    if (mode==='signup' && password.length<8) return Alert.alert('كلمة المرور قصيرة','استخدم 8 أحرف على الأقل.');
    if (mode==='signup' && password!==confirm) return Alert.alert('تأكيد كلمة المرور','كلمتا المرور غير متطابقتين.');
    setBusy(true);
    try {
      if (mode==='signup') {
        const {data,error}=await supabase.auth.signUp({
          email:cleanEmail,password,
          options:{data:{full_name:name.trim(),display_name:name.trim()}}
        });
        if (error) throw error;
        if (data.session) onSuccess(data.session);
        else Alert.alert('تحقق من بريدك الإلكتروني','أرسلنا رسالة تأكيد إلى بريدك. افتحها ثم ارجع وسجّل الدخول.');
      } else {
        const {data,error}=await supabase.auth.signInWithPassword({email:cleanEmail,password});
        if (error) throw error;
        onSuccess(data.session);
      }
    } catch(e) {
      Alert.alert('تعذّر إكمال العملية',e.message || 'حدث خطأ. حاول مرة أخرى.');
    } finally { setBusy(false); }
  }

  async function google() {
    setBusy(true);
    try {
      const redirectTo='forsati://auth/callback';
      const {data,error}=await supabase.auth.signInWithOAuth({
        provider:'google',
        options:{redirectTo,skipBrowserRedirect:true,queryParams:{prompt:'select_account'}}
      });
      if (error) throw error;
      if (!data?.url) throw new Error('لم يتم إنشاء رابط تسجيل الدخول.');
      const result=await WebBrowser.openAuthSessionAsync(data.url,redirectTo);
      if (result.type==='success' && result.url) {
        const callback=new URL(result.url);
        const code=callback.searchParams.get('code');
        if (code) {
          const {data:sessionData,error:exchangeError}=await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          onSuccess(sessionData.session);
        } else {
          const message=callback.searchParams.get('error_description');
          if (message) throw new Error(message);
        }
      }
    } catch(e) {
      Alert.alert('تسجيل Google غير مكتمل',e.message || 'تحقق من إعداد Google في لوحة Supabase.');
    } finally { setBusy(false); }
  }

  return <SafeAreaView style={{flex:1,backgroundColor:BG}}>
    <StatusBar barStyle="dark-content" backgroundColor={BG}/>
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
      <ScrollView contentContainerStyle={{flexGrow:1,justifyContent:'center',paddingHorizontal:25,paddingVertical:30}} keyboardShouldPersistTaps="handled">
        <Brand/>
        <View style={{backgroundColor:'#FFFFFF',borderRadius:24,padding:21,borderWidth:1,borderColor:'#EDF1F7'}}>
          <Text style={{fontSize:22,fontWeight:'900',color:DARK,textAlign:'right'}}>{mode==='signup'?'أنشئ حسابك':'أهلاً بعودتك'}</Text>
          <Text style={{fontSize:13,color:MUTED,textAlign:'right',marginTop:7,marginBottom:22}}>
            {mode==='signup'?'ابدأ رحلتك التعليمية مع فرصتي':'سجّل الدخول وتابع رحلتك التعليمية'}
          </Text>
          {mode==='signup' && <Field label="الاسم الكامل" value={name} onChangeText={setName} placeholder="اكتب اسمك"/>}
          <Field label="البريد الإلكتروني" value={email} onChangeText={setEmail} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none"/>
          <Field label="كلمة المرور" value={password} onChangeText={setPassword} placeholder="8 أحرف على الأقل" secure autoCapitalize="none"/>
          {mode==='signup' && <Field label="تأكيد كلمة المرور" value={confirm} onChangeText={setConfirm} placeholder="أعد كتابة كلمة المرور" secure autoCapitalize="none"/>}
          <ActionButton title={busy?'يرجى الانتظار...':mode==='signup'?'إنشاء الحساب':'تسجيل الدخول'} onPress={submit} disabled={busy}/>
          <View style={{flexDirection:'row',alignItems:'center',marginVertical:18}}>
            <View style={{height:1,backgroundColor:'#E8EDF5',flex:1}}/><Text style={{marginHorizontal:12,color:'#94A3B8',fontSize:12}}>أو</Text><View style={{height:1,backgroundColor:'#E8EDF5',flex:1}}/>
          </View>
          <ActionButton title="متابعة باستخدام Google" onPress={google} secondary disabled={busy}/>
          <TouchableOpacity onPress={()=>setMode(mode==='signup'?'login':'signup')} style={{paddingTop:22,alignItems:'center'}}>
            <Text style={{fontSize:13,color:MUTED}}>{mode==='signup'?'لديك حساب بالفعل؟ ':'ليس لديك حساب؟ '}
              <Text style={{color:BLUE,fontWeight:'900'}}>{mode==='signup'?'تسجيل الدخول':'إنشاء حساب'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
        {busy && <ActivityIndicator color={BLUE} style={{marginTop:16}}/>}
        <Text style={{textAlign:'center',fontSize:11,color:'#A0AEC0',marginTop:22}}>منصة فرصتي التعليمية • مجانية للجميع</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

function HomeScreen({session,onSignOut}) {
  const [tab,setTab]=useState('الرئيسية');
  const [query,setQuery]=useState('');
  const [selected,setSelected]=useState(null);
  const user=session?.user;
  const displayName=user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'متعلّم';
  const visible=useMemo(()=>categories.filter(c=>(c[1]+' '+c[2]).includes(query.trim())),[query]);

  function heading(title,subtitle) {
    return <View style={{alignItems:'flex-end',marginBottom:18}}>
      <Text style={{fontSize:25,fontWeight:'900',color:DARK,textAlign:'right'}}>{title}</Text>
      <Text style={{fontSize:13,color:MUTED,textAlign:'right',marginTop:6}}>{subtitle}</Text>
    </View>;
  }

  return <SafeAreaView style={{flex:1,backgroundColor:BG}}>
    <StatusBar barStyle="dark-content" backgroundColor={BG}/>
    <ScrollView contentContainerStyle={{padding:20,paddingBottom:110}} keyboardShouldPersistTaps="handled">
      <View style={{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <View style={{alignItems:'flex-end'}}>
          <Text style={{fontSize:27,fontWeight:'900',color:DARK}}>فرصتي</Text>
          <Text style={{fontSize:12,color:MUTED,marginTop:3}}>مساحتك لاكتساب مهارات جديدة</Text>
        </View>
        <View style={{width:46,height:46,borderRadius:15,backgroundColor:'#E7EFFF',alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontSize:25,color:BLUE,fontWeight:'900'}}>ف</Text>
        </View>
      </View>

      {tab==='الرئيسية' && <>
        <View style={{backgroundColor:'#1D4ED8',borderRadius:23,padding:22,marginBottom:25}}>
          <Text style={{color:'#DBEAFE',fontSize:13,textAlign:'right'}}>أهلاً {displayName} 👋</Text>
          <Text style={{color:'#FFFFFF',fontSize:24,fontWeight:'900',textAlign:'right',marginTop:10,lineHeight:36}}>كل مهارة جديدة،{ '\n' }تفتح لك فرصة جديدة</Text>
          <Text style={{color:'#DBEAFE',fontSize:13,textAlign:'right',marginTop:10}}>تعلّم باللغة العربية، وابدأ من المجال الذي تحبه.</Text>
          <TouchableOpacity onPress={()=>setTab('التصنيفات')} style={{backgroundColor:'#FFFFFF',paddingVertical:12,paddingHorizontal:17,borderRadius:12,alignSelf:'flex-end',marginTop:18}}>
            <Text style={{color:'#1D4ED8',fontWeight:'900'}}>استكشف المجالات ←</Text>
          </TouchableOpacity>
        </View>
        {heading('تعلّم حسب اهتمامك','اختر المجال الذي تريد البدء به')}
        <TextInput value={query} onChangeText={setQuery} placeholder="ابحث عن مجال..." placeholderTextColor="#94A3B8" style={[inputStyle,{marginTop:0,marginBottom:16}]}/>
        <View style={{flexDirection:'row-reverse',flexWrap:'wrap',justifyContent:'space-between'}}>
          {visible.map(c=><TouchableOpacity key={c[1]} onPress={()=>{setSelected(c);setTab('التصنيفات');}} style={{width:'48%',backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E8EDF5',borderRadius:18,padding:15,marginBottom:12,minHeight:125}}>
            <Text style={{fontSize:26,color:BLUE,textAlign:'right'}}>{c[0]}</Text>
            <Text style={{fontSize:15,fontWeight:'900',color:DARK,textAlign:'right',marginTop:9}}>{c[1]}</Text>
            <Text style={{fontSize:11,color:MUTED,textAlign:'right',marginTop:5,lineHeight:17}}>{c[2]}</Text>
          </TouchableOpacity>)}
        </View>
      </>}

      {tab==='التصنيفات' && <>
        {heading(selected?selected[1]:'جميع المجالات',selected?selected[2]:'اختر المجال الذي يناسب اهتماماتك')}
        {selected && <TouchableOpacity onPress={()=>setSelected(null)} style={{alignSelf:'flex-end',marginBottom:12}}><Text style={{color:BLUE,fontWeight:'800'}}>عرض جميع المجالات</Text></TouchableOpacity>}
        {categories.filter(c=>!selected||c[1]===selected[1]).map(c=><View key={c[1]} style={{backgroundColor:'#FFFFFF',borderRadius:16,padding:17,marginBottom:11,borderWidth:1,borderColor:'#E8EDF5',flexDirection:'row-reverse',alignItems:'center'}}>
          <View style={{width:48,height:48,borderRadius:14,backgroundColor:'#EDF3FF',alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:25,color:BLUE}}>{c[0]}</Text></View>
          <View style={{flex:1,marginRight:13,alignItems:'flex-end'}}><Text style={{fontSize:15,fontWeight:'900',color:DARK}}>{c[1]}</Text><Text style={{fontSize:12,color:MUTED,marginTop:5}}>{c[2]}</Text></View>
        </View>)}
      </>}

      {tab==='دوراتي' && <View style={{paddingTop:35}}>{heading('دوراتي','ستظهر هنا المسارات والدروس التي تبدأ بها')}<View style={{backgroundColor:'#FFFFFF',padding:25,borderRadius:18,alignItems:'center',borderWidth:1,borderColor:'#E8EDF5'}}><Text style={{fontSize:35,color:BLUE}}>▤</Text><Text style={{fontSize:15,fontWeight:'800',color:DARK,marginTop:12}}>لم تبدأ أي دورة بعد</Text><Text style={{fontSize:12,color:MUTED,marginTop:7}}>اختر مجالاً من التصنيفات لتبدأ رحلتك</Text><ActionButton title="استكشف المجالات" onPress={()=>setTab('التصنيفات')}/></View></View>}

      {tab==='حسابي' && <View style={{paddingTop:25}}>{heading('حسابي','إدارة حسابك في فرصتي')}<View style={{backgroundColor:'#FFFFFF',borderRadius:18,padding:20,borderWidth:1,borderColor:'#E8EDF5',alignItems:'flex-end'}}><View style={{width:58,height:58,borderRadius:20,backgroundColor:'#EAF1FF',alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:27,color:BLUE,fontWeight:'900'}}>{displayName.charAt(0)}</Text></View><Text style={{fontSize:18,fontWeight:'900',color:DARK,marginTop:13}}>{displayName}</Text><Text style={{fontSize:13,color:MUTED,marginTop:5}}>{user?.email}</Text><View style={{height:1,backgroundColor:'#EDF1F7',alignSelf:'stretch',marginVertical:18}}/><TouchableOpacity onPress={onSignOut} style={{paddingVertical:13,alignSelf:'stretch',alignItems:'center',borderRadius:12,backgroundColor:'#FFF1F1'}}><Text style={{color:'#C53030',fontWeight:'900'}}>تسجيل الخروج</Text></TouchableOpacity></View></View>}
    </ScrollView>
    <View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#FFFFFF',borderTopWidth:1,borderTopColor:'#E8EDF5',paddingTop:10,paddingBottom:Platform.OS==='android'?12:18,flexDirection:'row-reverse',justifyContent:'space-around'}}>
      {['الرئيسية','التصنيفات','دوراتي','حسابي'].map((n,i)=><TouchableOpacity key={n} onPress={()=>{setTab(n);if(n!=='التصنيفات')setSelected(null);}} style={{alignItems:'center',minWidth:65,paddingVertical:3}}>
        <Text style={{fontSize:21,color:tab===n?BLUE:'#94A3B8'}}>{['⌂','▦','▤','◉'][i]}</Text>
        <Text style={{fontSize:11,marginTop:4,fontWeight:tab===n?'900':'500',color:tab===n?BLUE:'#64748B'}}>{n}</Text>
      </TouchableOpacity>)}
    </View>
  </SafeAreaView>;
}

export default function App() {
  const [session,setSession]=useState(null);
  const [ready,setReady]=useState(false);
  const [authMode,setAuthMode]=useState('welcome');

  useEffect(()=>{
    let mounted=true;
    supabase.auth.getSession().then(({data})=>{if(mounted){setSession(data.session);setReady(true);}});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,nextSession)=>setSession(nextSession));
    return ()=>{mounted=false;subscription.unsubscribe();};
  },[]);

  if(!ready) return <SafeAreaView style={{flex:1,backgroundColor:BG,alignItems:'center',justifyContent:'center'}}><StatusBar barStyle="dark-content" backgroundColor={BG}/><Brand small/><ActivityIndicator color={BLUE}/></SafeAreaView>;
  if(session) return <HomeScreen session={session} onSignOut={async()=>{const {error}=await supabase.auth.signOut();if(error)Alert.alert('تعذّر تسجيل الخروج',error.message);}}/>;

  if(authMode==='welcome') return <SafeAreaView style={{flex:1,backgroundColor:BG}}>
    <StatusBar barStyle="dark-content" backgroundColor={BG}/>
    <View style={{flex:1,justifyContent:'center',paddingHorizontal:26}}>
      <Brand/>
      <View style={{backgroundColor:'#FFFFFF',borderRadius:24,padding:23,borderWidth:1,borderColor:'#EDF1F7',marginTop:15}}>
        <Text style={{fontSize:23,fontWeight:'900',color:DARK,textAlign:'center'}}>أهلاً بك في فرصتي</Text>
        <Text style={{fontSize:14,color:MUTED,textAlign:'center',lineHeight:23,marginTop:10,marginBottom:20}}>منصة تعليمية عربية تساعدك على اكتساب المهارات وفتح آفاق جديدة.</Text>
        <ActionButton title="إنشاء حساب جديد" onPress={()=>setAuthMode('signup')}/>
        <ActionButton title="تسجيل الدخول" onPress={()=>setAuthMode('login')} secondary/>
        <View style={{height:1,backgroundColor:'#EDF1F7',marginTop:23,marginBottom:17}}/>
        <TouchableOpacity onPress={()=>setAuthMode('google')} style={{height:52,borderRadius:14,borderWidth:1,borderColor:'#D9E2F1',alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
          <Text style={{fontSize:14,color:DARK,fontWeight:'800'}}>متابعة باستخدام Google</Text>
          <Text style={{fontSize:18,fontWeight:'900',color:'#4285F4',marginLeft:10}}>G</Text>
        </TouchableOpacity>
        <Text style={{fontSize:11,color:'#A0AEC0',textAlign:'center',marginTop:19}}>مجانية • باللغة العربية • متاحة للجميع</Text>
      </View>
    </View>
  </SafeAreaView>;

  return <AuthScreen mode={authMode==='google'?'login':authMode} setMode={setAuthMode} onSuccess={setSession}/>;
}
