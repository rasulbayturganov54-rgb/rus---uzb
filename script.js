// DOM elementlari
const translateBtn = document.getElementById('translateBtn');
const swapBtn = document.getElementById('swapBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const speakBtn = document.getElementById('speakBtn');
const speakInputBtn = document.getElementById('speakInputBtn');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const fromLang = document.getElementById('fromLang');
const toLang = document.getElementById('toLang');
const inputStats = document.getElementById('inputStats');
const lastTranslation = document.getElementById('lastTranslation');

// Google Translate API (Bepul versiya)
const TRANSLATE_API_URL = 'https://translate.googleapis.com/translate_a/single';

// Til kodlari
const languageCodes = {
    'uz': 'uz',
    'en': 'en',
    'ru': 'ru',
    'tr': 'tr',
    'ar': 'ar',
    'es': 'es',
    'fr': 'fr',
    'de': 'de',
    'zh': 'zh-CN',
    'ko': 'ko'
};

// Dasturni ishga tushirish
function initApp() {
    console.log("✅ Dastur ishga tushdi!");
    
    // Event listenerlarni o'rnatish
    translateBtn.addEventListener('click', translate);
    swapBtn.addEventListener('click', swapLanguages);
    clearBtn.addEventListener('click', clearInput);
    copyBtn.addEventListener('click', copyTranslation);
    speakBtn.addEventListener('click', speakTranslation);
    speakInputBtn.addEventListener('click', speakInput);
    
    // Matn o'zgarishini kuzatish
    inputText.addEventListener('input', updateStats);
    
    // Enter bilan tarjima qilish
    inputText.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            translate();
        }
    });
    
    // Avtomatik tarjima (500ms dan keyin)
    let timeout;
    inputText.addEventListener('input', function() {
        clearTimeout(timeout);
        if (inputText.value.length > 3) {
            timeout = setTimeout(translate, 500);
        }
    });
    
    // Dastur yuklanganda so'nggi tarjimani ko'rsatish
    const savedTranslation = localStorage.getItem('lastTranslation');
    if (savedTranslation) {
        lastTranslation.textContent = savedTranslation;
    }
}

// HAQIQIY TARJIMA QILISH FUNKSIYASI
async function translate() {
    const text = inputText.value.trim();
    
    if (!text) {
        showOutput("Iltimos, matn kiriting!", true);
        return;
    }
    
    const from = fromLang.value;
    const to = toLang.value;
    
    // Loyihalash holati
    showOutput("Tarjima qilinmoqda... <i class='fas fa-spinner fa-spin'></i>", false);
    
    // Tarjima tugmasini o'chirib qo'yish
    translateBtn.disabled = true;
    translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tarjimalanmoqda...';
    
    try {
        // Google Translate API dan foydalanish
        const translatedText = await translateText(text, from, to);
        
        // Natijani ko'rsatish
        showOutput(translatedText, false);
        
        // Saqlash
        saveTranslation(text, translatedText);
        
        // Konsolga chiqarish
        console.log(`Tarjima: "${text}" → "${translatedText}"`);
        
    } catch (error) {
        console.error("Tarjima xatosi:", error);
        showOutput("Tarjima qilishda xatolik yuz berdi. Internet aloqasini tekshiring.", true);
        
        // Agar API ishlamasa, simulyatsiya
        const simulatedTranslation = simulateTranslation(text, from, to);
        showOutput(simulatedTranslation, false);
    } finally {
        // Tugmani qayta yoqish
        translateBtn.disabled = false;
        translateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Tarjima qilish';
    }
}

// GOOGLE TRANSLATE API ORQALI TARJIMA
async function translateText(text, from, to) {
    // Google Translate API so'rov
    const params = new URLSearchParams({
        client: 'gtx',
        sl: from, // source language
        tl: to,   // target language
        dt: 't',
        q: text
    });
    
    const response = await fetch(`${TRANSLATE_API_URL}?${params}`);
    
    if (!response.ok) {
        throw new Error(`API javob bermadi: ${response.status}`);
    }
    
    const data = await response.json();
    
    // API javobini qayta ishlash
    let translatedText = '';
    
    // Google Translate API har doim massiv qaytaradi
    if (data && data[0]) {
        data[0].forEach(item => {
            if (item[0]) {
                translatedText += item[0];
            }
        });
    }
    
    return translatedText || text; // Agar bo'sh bo'lsa, asl matnni qaytar
}

// SIMULYATSIYA TARJIMA (API ishlamasa)
function simulateTranslation(text, from, to) {
    // Kichik lug'at
    const dictionary = {
        'uz-en': {
            'salom': 'hello',
            'dunyo': 'world',
            'kitob': 'book',
            'yaxshi': 'good',
            'rahmat': 'thank you',
            'men': 'I',
            'siz': 'you',
            'u': 'he/she',
            'biz': 'we',
            'ular': 'they'
        },
        'en-uz': {
            'hello': 'salom',
            'world': 'dunyo',
            'book': 'kitob',
            'good': 'yaxshi',
            'thank you': 'rahmat',
            'i': 'men',
            'you': 'siz',
            'he': 'u',
            'she': 'u',
            'we': 'biz',
            'they': 'ular'
        }
    };
    
    const key = `${from}-${to}`;
    
    if (dictionary[key]) {
        const words = text.toLowerCase().split(' ');
        const translatedWords = words.map(word => {
            // So'zni lug'atda qidirish
            const translated = dictionary[key][word];
            return translated || word;
        });
        
        // Birinchi harfni katta qilish
        let result = translatedWords.join(' ');
        result = result.charAt(0).toUpperCase() + result.slice(1);
        
        return result;
    }
    
    // Agar lug'atda bo'lmasa
    return `[${from.toUpperCase()} → ${to.toUpperCase()}] ${text}`;
}

// QOLGAN FUNKSIYALAR O'ZGARMASAN QOLADI...

// Natijani ko'rsatish
function showOutput(text, isError = false) {
    if (isError) {
        outputText.innerHTML = `<div class="error-message" style="color: #dc2626;">
            <i class="fas fa-exclamation-triangle"></i> ${text}
        </div>`;
    } else {
        outputText.innerHTML = text;
    }
    
    // Animatsiya effekti
    outputText.style.opacity = '0';
    outputText.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        outputText.style.transition = 'all 0.3s ease';
        outputText.style.opacity = '1';
        outputText.style.transform = 'translateY(0)';
    }, 10);
}

// Tillarni almashtirish
function swapLanguages() {
    const temp = fromLang.value;
    fromLang.value = toLang.value;
    toLang.value = temp;
    
    // Matnlarni ham almashtirish (agar tarjima bo'lsa)
    const currentOutput = outputText.textContent;
    if (!currentOutput.includes('Tarjima natijasi') && 
        !currentOutput.includes('Iltimos') &&
        !currentOutput.includes('Xatolik')) {
        
        const tempText = inputText.value;
        inputText.value = currentOutput;
        showOutput(tempText || 'Tarjima natijasi shu yerda ko\'rinadi...', false);
    }
    
    // Efekt
    swapBtn.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        swapBtn.style.transform = 'rotate(0deg)';
    }, 300);
    
    console.log("Tillarni almashtirildi");
}

// Kirish maydonini tozalash
function clearInput() {
    inputText.value = '';
    outputText.innerHTML = '<div class="placeholder">Tarjima natijasi shu yerda ko\'rinadi...</div>';
    updateStats();
    
    // Efekt
    inputText.style.borderColor = '#4f46e5';
    setTimeout(() => {
        inputText.style.borderColor = '#cbd5e1';
    }, 500);
    
    console.log("Tozalash amalga oshirildi");
}

// Tarjimani nusxalash
function copyTranslation() {
    const text = outputText.textContent;
    
    if (text.includes('Tarjima natijasi') || 
        text.includes('Iltimos') ||
        text.includes('Xatolik')) {
        alert("Nusxalash uchun tarjima mavjud emas!");
        return;
    }
    
    navigator.clipboard.writeText(text)
        .then(() => {
            // Muvaffaqiyatli xabari
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Nusxalandi!';
            copyBtn.style.background = '#10b981';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.background = '';
            }, 2000);
            
            console.log("Matn nusxalandi:", text);
        })
        .catch(err => {
            console.error("Nusxalashda xato:", err);
            alert("Nusxalash amalga oshmadi!");
        });
}

// Tarjimani tinglash (TTS)
function speakTranslation() {
    const text = outputText.textContent;
    
    if (text.includes('Tarjima natijasi') || 
        text.includes('Iltimos') ||
        text.includes('Xatolik')) {
        alert("Tinglash uchun tarjima mavjud emas!");
        return;
    }
    
    speakText(text, toLang.value);
}

// Kirish matnini tinglash
function speakInput() {
    const text = inputText.value;
    
    if (!text.trim()) {
        alert("Tinglash uchun matn kiriting!");
        return;
    }
    
    speakText(text, fromLang.value);
}

// Matnni ovozli qilish
function speakText(text, lang) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Tilni sozlash
        utterance.lang = getLanguageCode(lang);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Ovoz effekti
        speakBtn.disabled = true;
        speakBtn.innerHTML = '<i class="fas fa-volume-up fa-spin"></i> Tinglanmoqda...';
        
        speechSynthesis.speak(utterance);
        
        utterance.onend = function() {
            speakBtn.disabled = false;
            speakBtn.innerHTML = '<i class="fas fa-volume-up"></i> Tinglash';
            console.log("Ovozli tarjima tugadi");
        };
    } else {
        alert("Brauzeringiz ovozli o'qishni qo'llab-quvvatlamaydi!");
    }
}

// Til kodini olish
function getLanguageCode(lang) {
    const codes = {
        'en': 'en-US',
        'uz': 'uz-UZ',
        'ru': 'ru-RU',
        'tr': 'tr-TR'
    };
    return codes[lang] || 'en-US';
}

// Statistika yangilash
function updateStats() {
    const text = inputText.value;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    inputStats.textContent = `Belgilar: ${chars} | So'zlar: ${words}`;
    
    // Rang o'zgarishi
    if (chars > 100) {
        inputStats.style.background = '#f59e0b';
    } else if (chars > 50) {
        inputStats.style.background = '#3b82f6';
    } else {
        inputStats.style.background = '#4f46e5';
    }
}

// Tarjimani saqlash
function saveTranslation(original, translated) {
    const translationData = {
        original: original,
        translated: translated,
        from: fromLang.options[fromLang.selectedIndex].text,
        to: toLang.options[toLang.selectedIndex].text,
        time: new Date().toLocaleTimeString()
    };
    
    // LocalStorage ga saqlash
    localStorage.setItem('lastTranslation', 
        `${translationData.original} → ${translationData.translated}`);
    
    // UI da ko'rsatish
    lastTranslation.textContent = 
        `${translationData.original.substring(0, 30)}... → ${translationData.translated.substring(0, 30)}...`;
    
    // Konsolga chiqarish
    console.log("Tarjima saqlandi:", translationData);
}

// DOM tayyor bo'lganda dasturni ishga tushirish
document.addEventListener('DOMContentLoaded', initApp);

// Qo'shimcha: Oldindan yuklash effekti
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
        
        // Avtomatik demo matn
        setTimeout(() => {
            if (!inputText.value) {
                inputText.value = "Salom dunyo";
                updateStats();
                translate();
            }
        }, 1000);
    }, 100);
});

// Xatoliklarni ushlash
window.addEventListener('error', function(e) {
    console.error("Xatolik yuz berdi:", e.error);
    showOutput("Xatolik yuz berdi. Iltimos, sahifani yangilang.", true);
});
        