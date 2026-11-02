const SB_CFG={url:"https://dgsxwbfbuakxccgqenmw.supabase.co",key:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnc3h3YmZidWFreGNjZ3Flbm13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NzU0NjUsImV4cCI6MjEwNzI1MTQ2NX0.qgAfIa0Qd8CREiNnNEPJcOqIW1lKouuNS7BApO3kegY"}; // ضع Project URL و anon key من Supabase > Settings > API (المفتاح العام فقط)
const sb=(SB_CFG.url&&window.supabase)?window.supabase.createClient(SB_CFG.url,SB_CFG.key):null;
let _P=null,_S=null,ZONES=[],PROMOS=[];
// قائمة المحافظات (مشتركة بين الدفع والإدارة)
const GOVS=["الإسكندرية","القاهرة","الجيزة","البحيرة","القليوبية","الدقهلية","الشرقية","الغربية","المنوفية","كفر الشيخ","دمياط","بورسعيد","الإسماعيلية","السويس","الفيوم","بني سويف","المنيا","أسيوط","سوهاج","قنا","الأقصر","أسوان","مطروح","أخرى"];
const ORDER_ST={pending:"جديد",confirmed:"مؤكد",preparing:"قيد التجهيز",out_for_delivery:"في الطريق",delivered:"تم التسليم",cancelled:"ملغي"};
// ===== إعدادات المتجر: عدّل هنا (أو من admin.html) =====
const DEF_CFG={name:"BASHA FROZEN FOOD",description:"متجر متخصص في اللحوم والدواجن والمجمدات. جودة وثقة وتوصيل لحد باب البيت.",
whatsapp:"20XXXXXXXXXX", /* ضع رقم واتساب المتجر الحقيقي هنا (بدون +) */
phone:"",address:"",facebook:"",instagram:"",currency:"ج.م",deliveryFee:30,minimumOrder:0,freeDeliveryAbove:500,
heroImage:"assets/images/hero.jpg",offerImage:"assets/images/offer.jpg",policies:[], /* [["عنوان","نص"]] سياسات الإرجاع/التوصيل: أضفها بنصك الفعلي */
payments:"الدفع عند الاستلام",
benefits:[["truck","توصيل سريع","لجميع المناطق"],["shield","منتجات مضمونة","بأفضل الجودة"],["snow","مجمدات طازجة","دائماً"],["headset","خدمة عملاء","على مدار الساعة"],["lock","دفع آمن","متعدد الطرق"]]};
// [id, الاسم, رمز بديل, القسم الأب] — ضع صورة القسم في images/cat-<id>.jpg
// مع Supabase تُستبدل هذه القائمة بجدول categories (بما فيه الأقسام الفرعية)؛ هذه نسخة احتياطية للوضع المحلي فقط.
const CATS=[["poultry","الفراخ ومصنعات الدواجن","",""],["meat","اللحوم","",""],["burger","البرجر","",""],["birds","البط والسمان والطيور","",""],["fish","الأسماك والمأكولات البحرية","",""],["fries","البطاطس المجمدة","",""],["veg","الخضروات المجمدة","",""],["fruits","الفواكه المجمدة","",""],["cheese","الجبن ومنتجات الألبان","",""],["ghee","السمنة والزبدة","",""],["oils","الزيوت","",""],["grocery","البقالة والمعلبات","",""],["spices","التوابل والبهارات","",""],["mixed","مجمدات متنوعة","",""]];
// أمثلة تجريبية فقط — الأسعار غير حقيقية، عدّلها من لوحة التحكم
const P=(id,category,name,emoji,price,weight,oldPrice=0,popular=false,stock=0,available=true)=>({id,category,name,emoji,description:weight,weight,price,unit:"قطعة",oldPrice,popular,stock,available,image:""});
const DEF_PRODUCTS=[P(1,"poultry","دجاجة كاملة","",120,"1.2 كجم تقريباً",0,1),P(2,"burger","برجر لحم","",220,"عبوة 8 قطع",250,1),P(3,"meat","لحم مفروم فاخر","",320,"1 كجم",0,1),P(4,"poultry","أجنحة دجاج","",160,"1 كجم",0,1),P(5,"meat","ستيك لحم بقري","",280,"500 جم"),P(6,"fish","فيليه سلمون","",380,"500 جم",450),P(7,"fish","جمبري","",420,"1 كجم",0,0,5),P(8,"mixed","ناجتس دجاج","",160,"800 جم"),P(9,"mixed","كفتة مجمدة","",240,"1 كجم"),P(10,"veg","بسلة وجزر","",75,"1 كجم"),P(11,"veg","ملوخية مجمدة","",65,"400 جم"),P(12,"fries","بطاطس نصف مقلية","",95,"2.5 كجم"),P(13,"fries","أصابع موتزاريلا","",110,"400 جم"),P(14,"poultry","أوراك دجاج","",150,"1 كجم"),P(15,"fish","كاليماري","",350,"1 كجم",0,0,0,false)];
