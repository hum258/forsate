import React, {useState} from 'react';
import {SafeAreaView,View,Text,ScrollView,TouchableOpacity,TextInput,StatusBar} from 'react-native';
const blue='#2563EB';
const cats=[['💻','البرمجة','تعلم بناء التطبيقات والمواقع'],['🛡️','الأمن السيبراني','افهم الحماية والأمان الرقمي'],['🎨','التصميم','ابدأ رحلتك في التصميم والإبداع'],['🤖','الذكاء الاصطناعي','اكتشف أدوات وتقنيات الذكاء الاصطناعي'],['📣','التسويق الرقمي','تعلم التسويق وصناعة المحتوى'],['🚀','ريادة الأعمال','حوّل أفكارك إلى مشاريع'],['🌐','اللغات','طوّر مهاراتك اللغوية'],['🧰','المهارات الرقمية','مهارات العالم الرقمي'],['🔬','العلوم والهندسة','اكتشف العلوم والتقنيات'],['💼','المهارات المهنية','استعد للدراسة والعمل']];
export default function App(){
 const [tab,setTab]=useState('الرئيسية'); const [q,setQ]=useState('');
 const shown=cats.filter(c=>c[1].includes(q.trim()));
 const nav=['الرئيسية','التصنيفات','دوراتي','حسابي'];
 return <SafeAreaView style={{flex:1,backgroundColor:'#F7F9FC'}}>
  <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC"/>
  <ScrollView contentContainerStyle={{padding:20,paddingBottom:110}}>
   <View style={{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
    <View style={{alignItems:'flex-end'}}><Text style={{fontSize:28,fontWeight:'900',color:'#172554'}}>فرصتي</Text><Text style={{fontSize:12,color:'#64748B',marginTop:3}}>تعلّم اليوم، واصنع فرصتك غداً</Text></View>
    <View style={{width:48,height:48,borderRadius:16,backgroundColor:'#E8F0FF',alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:25,color:blue}}>✦</Text></View>
   </View>
   <View style={{backgroundColor:'#1D4ED8',borderRadius:22,padding:20,marginBottom:23}}>
    <Text style={{color:'#DBEAFE',fontSize:13,textAlign:'right'}}>خطوتك الأولى تبدأ من هنا</Text>
    <Text style={{color:'#FFF',fontSize:23,fontWeight:'800',textAlign:'right',marginTop:8,lineHeight:35}}>اكتشف مهارة جديدة{'\n'}وافتح لنفسك فرصاً أكثر</Text>
    <Text style={{color:'#DBEAFE',fontSize:13,textAlign:'right',marginTop:10}}>محتوى تعليمي باللغة العربية ومتاح للجميع</Text>
    <TouchableOpacity onPress={()=>setTab('التصنيفات')} style={{backgroundColor:'#FFF',padding:12,borderRadius:12,alignSelf:'flex-end',marginTop:16}}><Text style={{color:'#1D4ED8',fontWeight:'800'}}>استكشف المجالات ←</Text></TouchableOpacity>
   </View>
   <View style={{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><Text style={{fontSize:19,fontWeight:'800',color:'#172554'}}>تعلّم حسب اهتمامك</Text><TouchableOpacity onPress={()=>setTab('التصنيفات')}><Text style={{color:blue,fontWeight:'700'}}>عرض الكل</Text></TouchableOpacity></View>
   <TextInput value={q} onChangeText={setQ} placeholder="ابحث عن مجال..." placeholderTextColor="#94A3B8" style={{backgroundColor:'#FFF',borderWidth:1,borderColor:'#E2E8F0',borderRadius:14,padding:14,textAlign:'right',marginBottom:15}}/>
   <View style={{flexDirection:'row-reverse',flexWrap:'wrap',justifyContent:'space-between'}}>
    {shown.map(c=><TouchableOpacity key={c[1]} onPress={()=>setTab(c[1])} style={{width:'48%',backgroundColor:'#FFF',borderWidth:1,borderColor:'#E8EDF5',borderRadius:17,padding:14,marginBottom:12,minHeight:120}}>
     <Text style={{fontSize:25,textAlign:'right'}}>{c[0]}</Text><Text style={{fontSize:15,fontWeight:'800',color:'#1E293B',textAlign:'right',marginTop:9}}>{c[1]}</Text><Text style={{fontSize:11,color:'#64748B',textAlign:'right',marginTop:5,lineHeight:17}}>{c[2]}</Text>
    </TouchableOpacity>)}
   </View>
   {tab!=='الرئيسية'&&<View style={{backgroundColor:'#EFF6FF',padding:15,borderRadius:14,marginTop:8}}><Text style={{textAlign:'right',color:'#1D4ED8',fontWeight:'700'}}>قسم {tab}</Text><Text style={{textAlign:'right',color:'#475569',marginTop:5,fontSize:12}}>هذه نسخة تأسيسية، وسنضيف الدروس والمحتوى في المراحل التالية.</Text></View>}
  </ScrollView>
  <View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#FFF',borderTopWidth:1,borderTopColor:'#E8EDF5',paddingTop:11,paddingBottom:18,flexDirection:'row-reverse',justifyContent:'space-around'}}>
   {nav.map((n,i)=><TouchableOpacity key={n} onPress={()=>setTab(n)} style={{alignItems:'center',minWidth:65}}><Text style={{fontSize:20,color:tab===n?blue:'#94A3B8'}}>{['⌂','▦','▤','◉'][i]}</Text><Text style={{fontSize:11,marginTop:4,fontWeight:tab===n?'800':'500',color:tab===n?blue:'#64748B'}}>{n}</Text></TouchableOpacity>)}
  </View>
 </SafeAreaView>;
}
