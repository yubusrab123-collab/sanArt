window.addEventListener('scroll', function() {
    var kaydirmaMiktari = window.scrollY;
    var mobileNav = document.querySelector('.mobile-nav.index-nav');
    var siteHeader = document.querySelector('.site-header.index-header');
    
    var text = document.getElementById('text');
    var treeLeft = document.getElementById('tree-left');
    var treeRight = document.getElementById('tree-right');
    var gateLeft = document.getElementById('gate-left');
    var gateRight = document.getElementById('gate-right');
    var heroAlan = document.getElementById('parallaxAlan');
    
    if (kaydirmaMiktari > 150) {
        if (mobileNav) mobileNav.classList.add('goster');
        if (siteHeader) siteHeader.classList.add('goster');
    } else {
        if (mobileNav) mobileNav.classList.remove('goster');
        if (siteHeader) siteHeader.classList.remove('goster');
    }

    if (text) {
        text.style.transform = 'translateY(' + (kaydirmaMiktari * 1.5) + 'px)';
    }
    if (treeLeft) {
        treeLeft.style.transform = 'translateX(' + (-15 + (kaydirmaMiktari * -0.8)) + 'px)';
    }
    if (treeRight) {
        treeRight.style.transform = 'translateX(' + (15 + (kaydirmaMiktari * 0.8)) + 'px)';
    }
    
    if (gateLeft) {
        gateLeft.style.transform = 'translateX(calc(-15% + ' + (kaydirmaMiktari * -0.5) + 'px))';
    }
    if (gateRight) {
        gateRight.style.transform = 'translateX(calc(15% + ' + (kaydirmaMiktari * 0.5) + 'px))';
    }

    if (heroAlan) {
        if (kaydirmaMiktari <= 5) {
            heroAlan.style.borderTop = 'none';
            heroAlan.style.borderBottom = 'none';
        } else {
            var oran = Math.min(kaydirmaMiktari / 150, 1);
            var kalinlik = oran * 3; 
            heroAlan.style.borderTop = kalinlik + 'px solid rgba(191, 164, 135, ' + oran + ')';
            heroAlan.style.borderBottom = kalinlik + 'px solid rgba(191, 164, 135, ' + oran + ')';
        }
    }
});

window.onload = function() {
    // Firebase Auth oturum durumunu dinamik olarak dinle
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(async function(user) {
            if (user) {
                // Kullanıcı giriş yapmışsa verilerini çek ve güncelle
                let kullaniciAdi = user.displayName;
                try {
                    let userDoc = await db.collection("users").doc(user.uid).get();
                    if (userDoc.exists && userDoc.data().kullaniciAdi) {
                        kullaniciAdi = userDoc.data().kullaniciAdi;
                    } else if (!kullaniciAdi && user.email) {
                        kullaniciAdi = user.email.split('@')[0];
                    }
                } catch (e) {
                    kullaniciAdi = user.displayName || (user.email ? user.email.split('@')[0] : "Sanatçı");
                }

                localStorage.setItem("sanart_kullanici", kullaniciAdi);
                
                // Avatar kontrolü
                let savedAvatar = localStorage.getItem("sanart_avatar_" + kullaniciAdi) || localStorage.getItem("sanart_avatar");
                kullaniciBilgileriniYansit(kullaniciAdi, savedAvatar);
                yoneticiKontroluYap(kullaniciAdi);
            } else {
                // ÇIKIŞ YAPILDIYSA: Yerel hafızayı ve arayüzü tamamen temizle
                localStorage.removeItem("sanart_kullanici");
                localStorage.removeItem("sanart_avatar");
                
                kullaniciBilgileriniYansit("Profil", null);
                yoneticiKontroluYap("");
            }
        });
    } else {
        // Firebase yüklenemediyse eski localstorage mekanizması
        var kaydedilenKullanici = localStorage.getItem("sanart_kullanici");
        var kaydedilenAvatar = localStorage.getItem("sanart_avatar");
        
        if (kaydedilenKullanici) {
            kullaniciBilgileriniYansit(kaydedilenKullanici, kaydedilenAvatar);
            yoneticiKontroluYap(kaydedilenKullanici);
        }
    }
    
    sergiKontrolVeYukle();
    etkinlikleriYukle();
    duyurulariYukle();
   
};

/* --- YÖNETİCİ KONTROL SİSTEMİ --- */
function yoneticiKontroluYap(kullaniciAdi) {
    var yoneticiler = ["admin", "baskan", "yonetici", "sanart"]; 
    var kAdiKucuk = kullaniciAdi ? kullaniciAdi.toLowerCase() : "";
    var yoneticiMi = yoneticiler.includes(kAdiKucuk) || yoneticiler.some(function(y) { return kAdiKucuk.includes(y); });

    window.isYonetici = yoneticiMi;

    var yoneticiDuyuruPaneli = document.getElementById('yoneticiDuyuruPaneli');
    var yoneticiEtkinlikPaneli = document.getElementById('yoneticiEtkinlikPaneli');

    if (yoneticiMi) {
        if (yoneticiDuyuruPaneli) yoneticiDuyuruPaneli.style.display = "block";
        if (yoneticiEtkinlikPaneli) yoneticiEtkinlikPaneli.style.display = "block";
    } else {
        if (yoneticiDuyuruPaneli) yoneticiDuyuruPaneli.style.display = "none";
        if (yoneticiEtkinlikPaneli) yoneticiEtkinlikPaneli.style.display = "none";
    }
}

function kullaniciBilgileriniYansit(ad, avatarVeyaHarf) {
    var profilMetin = document.getElementById('altMenuProfilMetin');
    if(profilMetin) profilMetin.innerText = ad;
    
    var altMenuAvatarBox = document.getElementById('altMenuAvatarBox');
    var altMenuAvatarHarf = document.getElementById('altMenuAvatarHarf');

    if (altMenuAvatarBox && altMenuAvatarHarf) {
        if (avatarVeyaHarf && avatarVeyaHarf.startsWith('data:image')) {
            altMenuAvatarBox.style.backgroundImage = "url('" + avatarVeyaHarf + "')";
            altMenuAvatarHarf.style.display = "none";
        } else {
            var harf = ad.charAt(0).toUpperCase();
            altMenuAvatarBox.style.backgroundImage = "none";
            altMenuAvatarHarf.style.display = "block";
            altMenuAvatarHarf.innerText = harf;
        }
    }
}

function menuAcKapat() {
    var menu = document.getElementById('ucNoktaMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

window.onclick = function(event) {
    if (!event.target.matches('button')) {
        var menu = document.getElementById('ucNoktaMenu');
        if (menu && menu.style.display === 'block') {
            menu.style.display = 'none';
        }
    }
};

/* --- OTOMATİK SERGİ SİSTEMİ --- */
function sergiKontrolVeYukle() {
    var simdi = new Date();
    var gun = simdi.getDate();
    var sergiDiv = document.getElementById('sergiAlani');

    if (!sergiDiv) return;

    if (gun >= 15) {
        // Firestore veya yedekten eserleri güvenle çekiyoruz
        eserleriGetir(function(eserler) {
            eserler.sort(function(a, b) {
                return (b.begeni || 0) - (a.begeni || 0);
            });
            
            var enIyiOnEser = eserler.slice(0, 10);

            if (enIyiOnEser.length > 0) {
                sergiDiv.innerHTML = "";
                enIyiOnEser.forEach(function(eser) {
                    var kutu = document.createElement('div');
                    kutu.style.cssText = "background: #faf6f0; border: 1px solid #b895657; border-radius: 6px; overflow: hidden; text-align: center; padding: 5px; cursor: pointer;";
                    kutu.innerHTML = `
                        <img src="${eser.gorsel}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px;" onclick="location.href='sergi.html'">
                        <span style="font-size: 10px; display: block; margin-top: 3px; color: #2b2201; font-weight: bold;">${eser.baslik || 'Sanat Eseri'}</span>
                    `;
                    sergiDiv.appendChild(kutu);
                });
            } else {
                sergiDiv.innerHTML = `<p style="font-size: 12px; color: #2b2201; grid-column: 1 / -1; text-align: center;">Sergi için henüz yeterli eser bulunmuyor.</p>`;
            }
        });
    } else {
        sergiDiv.innerHTML = ""; 
    }
}

/* --- DUYURULAR SİSTEMİ (FİREBASE) --- */
async function duyuruEkleIslemi() {
    var baslik = document.getElementById('duyuruBaslik').value.trim();
    var icerik = document.getElementById('duyuruIcerik').value.trim();

    if (baslik === "" || icerik === "") {
        alert("Lütfen duyuru başlığı ve içeriğini doldur dostum!");
        return;
    }

    var yeniDuyuru = {
        baslik: baslik,
        icerik: icerik,
        tarih: new Date().toLocaleDateString('tr-TR'),
        tarihMs: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (db) {
        try {
            await db.collection("duyurular").add(yeniDuyuru);
            document.getElementById('duyuruBaslik').value = "";
            document.getElementById('duyuruIcerik').value = "";
            duyurulariYukle();
            alert("Duyuru başarıyla yayınlandı!");
        } catch (hata) {
            console.error("Duyuru ekleme hatası:", hata);
            alert("Duyuru eklenirken bir hata oluştu.");
        }
    } else {
        var duyurular = JSON.parse(localStorage.getItem("sanart_duyurular") || "[]");
        yeniDuyuru.id = Date.now();
        duyurular.unshift(yeniDuyuru);
        localStorage.setItem("sanart_duyurular", JSON.stringify(duyurular));
        document.getElementById('duyuruBaslik').value = "";
        document.getElementById('duyuruIcerik').value = "";
        duyurulariYukle();
        alert("Duyuru başarıyla yayınlandı (Yerel hafıza)!");
    }
}

async function duyurulariYukle() {
    var listeDiv = document.getElementById('duyuruListesi');
    if (!listeDiv) return;

    if (db) {
        try {
            var snapshot = await db.collection("duyurular").orderBy("tarihMs", "desc").get();
            if (!snapshot.empty) {
                listeDiv.innerHTML = "";
                snapshot.forEach(function(doc) {
                    var duyuru = doc.data();
                    var duyuruId = doc.id;
                    
                    var div = document.createElement('div');
                    div.style.cssText = "border: 1px solid #bfa487; border-radius: 6px; padding: 8px; background: #faf6f0; position: relative;";
                    
                    var silButonuHTML = window.isYonetici ? `<button onclick="duyuruSil('${duyuruId}')" style="position: absolute; top: 8px; right: 8px; background: #a65b32; color: #fff; border: none; padding: 2px 6px; font-size: 10px; border-radius: 4px; cursor: pointer; width: auto;">Sil</button>` : '';

                    div.innerHTML = `
                        ${silButonuHTML}
                        <h4 style="font-size: 13px; color: #a65b32; margin-bottom: 4px; padding-right: 30px;">📢 ${duyuru.baslik}</h4>
                        <p style="font-size: 12px; color: #2c221e; white-space: pre-wrap;">${duyuru.icerik}</p>
                        <span style="font-size: 9px; color: #7a6555; display: block; margin-top: 4px; text-align: right;">${duyuru.tarih || ''}</span>
                    `;
                    listeDiv.appendChild(div);
                });
                return;
            }
        } catch (e) {
            console.error("Firestore duyuru çekme hatası:", e);
        }
    }

    var duyurular = JSON.parse(localStorage.getItem("sanart_duyurular") || "[]");
    if (duyurular.length > 0) {
        listeDiv.innerHTML = "";
        duyurular.forEach(function(duyuru) {
            var div = document.createElement('div');
            div.style.cssText = "border: 1px solid #bfa487; border-radius: 6px; padding: 8px; background: #faf6f0; position: relative;";
            var silButonuHTML = window.isYonetici ? `<button onclick="duyuruSil(${duyuru.id})" style="position: absolute; top: 8px; right: 8px; background: #a65b32; color: #fff; border: none; padding: 2px 6px; font-size: 10px; border-radius: 4px; cursor: pointer; width: auto;">Sil</button>` : '';

            div.innerHTML = `
                ${silButonuHTML}
                <h4 style="font-size: 13px; color: #a65b32; margin-bottom: 4px; padding-right: 30px;">📢 ${duyuru.baslik}</h4>
                <p style="font-size: 12px; color: #2c221e; white-space: pre-wrap;">${duyuru.icerik}</p>
                <span style="font-size: 9px; color: #7a6555; display: block; margin-top: 4px; text-align: right;">${duyuru.tarih}</span>
            `;
            listeDiv.appendChild(div);
        });
    } else {
        listeDiv.innerHTML = `<p style="font-style: italic; color: #2b2201;">Henüz aktif bir duyuru bulunmuyor.</p>`;
    }
}

async function duyuruSil(id) {
    if (confirm("Bu duyuruyu silmek istediğine emin misin?")) {
        if (db && typeof id === 'string') {
            try {
                await db.collection("duyurular").doc(id).delete();
                duyurulariYukle();
                return;
            } catch (e) {
                console.error("Duyuru silme hatası:", e);
            }
        }
        var duyurular = JSON.parse(localStorage.getItem("sanart_duyurular") || "[]");
        duyurular = duyurular.filter(function(d) { return d.id !== id; });
        localStorage.setItem("sanart_duyurular", JSON.stringify(duyurular));
        duyurulariYukle();
    }
}

/* --- ETKİNLİK TAKVİMİ SİSTEMİ (FİREBASE ENTEGRELİ) --- */
function etkinlikEkleIslemi() {
    var baslik = document.getElementById('etkinlikBaslik').value.trim();
    var aciklama = document.getElementById('etkinlikAciklama').value.trim();
    var dosyaInput = document.getElementById('etkinlikGorsel');

    if (baslik === "") {
        alert("Lütfen bir etkinlik başlığı yaz dostum!");
        return;
    }
    if (dosyaInput.files.length === 0) {
        alert("Lütfen bir etkinlik görseli seç dostum!");
        return;
    }

    var dosya = dosyaInput.files[0];
    var okuyuko = new FileReader();

    okuyuko.onload = function(e) {
        var img = new Image();
        img.src = e.target.result;
        img.onload = function() {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            
            var maxGenislik = 600;
            var maxYukseklik = 900;
            var genislik = img.width;
            var yukseklik = img.height;

            if (genislik > yukseklik) {
                if (genislik > maxGenislik) {
                    yukseklik = yukseklik * (maxGenislik / genislik);
                    genislik = maxGenislik;
                }
            } else {
                if (yukseklik > maxYukseklik) {
                    genislik = genislik * (maxYukseklik / yukseklik);
                    yukseklik = maxYukseklik;
                }
            }

            canvas.width = genislik;
            canvas.height = yukseklik;
            ctx.drawImage(img, 0, 0, genislik, yukseklik);

            var optimizeGorsel = canvas.toDataURL('image/jpeg', 0.7);

            var yeniEtkinlik = {
                baslik: baslik,
                aciklama: aciklama,
                gorsel: optimizeGorsel,
                begeni: 0,
                begenenler: [],
                tarihMs: firebase ? firebase.firestore.FieldValue.serverTimestamp() : Date.now()
            };

            if (db) {
                db.collection("etkinlikler").add(yeniEtkinlik).then(function() {
                    document.getElementById('etkinlikBaslik').value = "";
                    document.getElementById('etkinlikAciklama').value = "";
                    dosyaInput.value = "";
                    etkinlikleriYukle();
                    alert("Etkinlik başarıyla Firebase'e kaydedildi!");
                }).catch(function(hata) {
                    console.error("Firestore etkinlik ekleme hatası:", hata);
                    alert("Etkinlik eklenirken bir hata oluştu.");
                });
            } else {
                var etkinlikler = JSON.parse(localStorage.getItem("sanart_etkinlikler") || "[]");
                yeniEtkinlik.id = Date.now();
                etkinlikler.unshift(yeniEtkinlik);
                localStorage.setItem("sanart_etkinlikler", JSON.stringify(etkinlikler));

                document.getElementById('etkinlikBaslik').value = "";
                document.getElementById('etkinlikAciklama').value = "";
                dosyaInput.value = "";
                etkinlikleriYukle();
                alert("Etkinlik başarıyla yayınlandı (Yerel hafıza)!");
            }
        };
    };
    okuyuko.readAsDataURL(dosya);
}

async function etkinlikleriYukle() {
    var listeDiv = document.getElementById('etkinlikListesi');
    if (!listeDiv) return;

    var aktifKullanici = (typeof aktifKullaniciGetir === 'function') ? aktifKullaniciGetir() : (localStorage.getItem("sanart_kullanici") || "Misafir");

    if (db) {
        try {
            var snapshot = await db.collection("etkinlikler").orderBy("tarihMs", "desc").get();
            if (!snapshot.empty) {
                listeDiv.innerHTML = "";
                snapshot.forEach(function(doc) {
                    var et = doc.data();
                    var etId = doc.id;
                    
                    var div = document.createElement('div');
                    div.style.cssText = "border: 1px solid #bfa487; border-radius: 8px; padding: 10px; background: #faf6f0; position: relative;";
                    
                    var silButonuHTML = window.isYonetici ? `<button onclick="etkinlikSil('${etId}')" style="position: absolute; top: 10px; right: 10px; background: #a65b32; color: #fff; border: none; padding: 3px 8px; font-size: 10px; border-radius: 4px; cursor: pointer; z-index: 10; width: auto;">Sil</button>` : '';

                    var begenenlerDizisi = et.begenenler || [];
                    var zatenBegenmisMi = begenenlerDizisi.includes(aktifKullanici);
                    var kalpStili = zatenBegenmisMi ? "cursor: pointer; font-size: 18px; filter: drop-shadow(0 0 2px red);" : "cursor: pointer; font-size: 18px; opacity: 0.7;";

                    div.innerHTML = `
                        ${silButonuHTML}
                        <div style="width: 100%; height: 360px; overflow: hidden; border-radius: 6px; border: 1px solid #bfa487; margin-bottom: 8px; background: #1a1a1a; display: flex; align-items: center; justify-content: center;">
                            <img src="${et.gorsel}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;">
                        </div>
                        <h3 style="font-size: 14px; color: #a65b32; margin: 5px 0;">${et.baslik}</h3>
                        <p style="font-size: 12px; color: #2c221e; margin-bottom: 8px; white-space: pre-wrap;">${et.aciklama}</p>
                        <div style="display: flex; align-items: center; gap: 5px; border-top: 1px solid #bfa487; padding-top: 6px;">
                            <span style="${kalpStili}" onclick="etkinlikBegeniArttir('${etId}')">❤️</span>
                            <span style="font-size: 12px; font-weight: bold; color: #2c221e;">${et.begeni || 0} Beğeni</span>
                        </div>
                    `;
                    listeDiv.appendChild(div);
                });
                return;
            }
        } catch (e) {
            console.error("Firestore etkinlik çekme hatası:", e);
        }
    }

    var etkinlikler = JSON.parse(localStorage.getItem("sanart_etkinlikler") || "[]");
    var begenilenlerYerel = JSON.parse(localStorage.getItem("sanart_begenilen_etkinlikler") || "[]");

    if (etkinlikler.length > 0) {
        listeDiv.innerHTML = "";
        etkinlikler.forEach(function(et) {
            var div = document.createElement('div');
            div.style.cssText = "border: 1px solid #bfa487; border-radius: 8px; padding: 10px; background: #faf6f0; position: relative;";
            
            var silButonuHTML = window.isYonetici ? `<button onclick="etkinlikSil(${et.id})" style="position: absolute; top: 10px; right: 10px; background: #a65b32; color: #fff; border: none; padding: 3px 8px; font-size: 10px; border-radius: 4px; cursor: pointer; z-index: 10; width: auto;">Sil</button>` : '';

            var zatenBegenmisMiYerel = begenilenlerYerel.includes(et.id);
            var kalpStiliYerel = zatenBegenmisMiYerel ? "cursor: pointer; font-size: 18px; filter: drop-shadow(0 0 2px red);" : "cursor: pointer; font-size: 18px; opacity: 0.7;";

            div.innerHTML = `
                ${silButonuHTML}
                <div style="width: 100%; height: 360px; overflow: hidden; border-radius: 6px; border: 1px solid #bfa487; margin-bottom: 8px; background: #1a1a1a; display: flex; align-items: center; justify-content: center;">
                    <img src="${et.gorsel}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;">
                </div>
                <h3 style="font-size: 14px; color: #a65b32; margin: 5px 0;">${et.baslik}</h3>
                <p style="font-size: 12px; color: #2c221e; margin-bottom: 8px; white-space: pre-wrap;">${et.aciklama}</p>
                <div style="display: flex; align-items: center; gap: 5px; border-top: 1px solid #bfa487; padding-top: 6px;">
                    <span style="${kalpStiliYerel}" onclick="etkinlikBegeniArttir(${et.id})">❤️</span>
                    <span style="font-size: 12px; font-weight: bold; color: #2c221e;">${et.begeni || 0} Beğeni</span>
                </div>
            `;
            listeDiv.appendChild(div);
        });
    } else {
        listeDiv.innerHTML = `<p style="font-style: italic; color: #2b2201;">Henüz planlanmış yeni bir etkinlik yok.</p>`;
    }
}

async function etkinlikSil(id) {
    if (confirm("Bu etkinliği silmek istediğine emin misin?")) {
        if (db && typeof id === 'string') {
            try {
                await db.collection("etkinlikler").doc(id).delete();
                etkinlikleriYukle();
                return;
            } catch (e) {
                console.error("Firestore etkinlik silme hatası:", e);
            }
        }

        var etkinlikler = JSON.parse(localStorage.getItem("sanart_etkinlikler") || "[]");
        etkinlikler = etkinlikler.filter(function(e) { return e.id !== id; });
        localStorage.setItem("sanart_etkinlikler", JSON.stringify(etkinlikler));
        
        var begenilenler = JSON.parse(localStorage.getItem("sanart_begenilen_etkinlikler") || "[]");
        begenilenler = begenilenler.filter(function(bId) { return bId !== id; });
        localStorage.setItem("sanart_begenilen_etkinlikler", JSON.stringify(begenilenler));

        etkinlikleriYukle();
    }
}

async function etkinlikBegeniArttir(id) {
    var aktifKullanici = (typeof aktifKullaniciGetir === 'function') ? aktifKullaniciGetir() : (localStorage.getItem("sanart_kullanici") || "Misafir");

    if (db && typeof id === 'string') {
        try {
            var docRef = db.collection("etkinlikler").doc(id);
            var doc = await docRef.get();
            if (doc.exists) {
                var veri = doc.data();
                var begenenler = veri.begenenler || [];
                var begeniSayisi = veri.begeni || 0;

                var index = begenenler.indexOf(aktifKullanici);
                if (index > -1) {
                    begenenler.splice(index, 1);
                    begeniSayisi = Math.max(0, begeniSayisi - 1);
                } else {
                    begenenler.push(aktifKullanici);
                    begeniSayisi += 1;
                }

                await docRef.update({
                    begeni: begeniSayisi,
                    begenenler: begenenler
                });

                etkinlikleriYukle();
                return;
            }
        } catch (e) {
            console.error("Firestore beğeni güncelleme hatası:", e);
        }
    }

    var begenilenler = JSON.parse(localStorage.getItem("sanart_begenilen_etkinlikler") || "[]");
    var etkinlikler = JSON.parse(localStorage.getItem("sanart_etkinlikler") || "[]");
    var etkinlik = etkinlikler.find(function(e) { return e.id === id; });

    if (!etkinlik) return;

    if (begenilenler.includes(id)) {
        etkinlik.begeni = Math.max(0, (etkinlik.begeni || 1) - 1);
        begenilenler = begenilenler.filter(function(bId) { return bId !== id; });
    } else {
        etkinlik.begeni = (etkinlik.begeni || 0) + 1;
        begenilenler.push(id);
    }

    localStorage.setItem("sanart_etkinlikler", JSON.stringify(etkinlikler));
    localStorage.setItem("sanart_begenilen_etkinlikler", JSON.stringify(begenilenler));
    etkinlikleriYukle();
}

// ==========================================
// FİREBASE FIRESTORE ENTEGRASYONU (YARDIMCI METOTLAR)
// ==========================================

let auth = null;
try {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0 && !auth) {
        auth = firebase.auth();
    }
} catch (e) {
    console.warn("Auth servisi başlatılamadı.", e);
}

function aktifKullaniciGetir() {
    return localStorage.getItem("sanart_kullanici") || "Misafir";
}

function oturumKontroluUI() {
    let aktif = aktifKullaniciGetir();
    let profilMetin = document.getElementById('altMenuProfilMetin');
    let profilHarf = document.getElementById('altMenuAvatarHarf');
    
    if (aktif && aktif !== "Misafir") {
        if(profilMetin) profilMetin.innerText = aktif;
        if(profilHarf) profilHarf.innerText = aktif.charAt(0).toUpperCase();
    }
}

async function eserleriGetir(callback) {
    if (db) {
        try {
            let snapshot = await db.collection("eserler").get();
            let eserler = [];
            snapshot.forEach(doc => {
                eserler.push({ id: doc.id, ...doc.data() });
            });
            
            // Tarih alanına göre garanti sıralama (En yeni en üste)
            eserler.sort((a, b) => {
                let tA = a.tarihMs && a.tarihMs.toMillis ? a.tarihMs.toMillis() : (a.tarihMs || 0);
                let tB = b.tarihMs && b.tarihMs.toMillis ? b.tarihMs.toMillis() : (b.tarihMs || 0);
                return tB - tA; // Büyükten küçüğe (En yeni en başta)
            });

            callback(eserler);
            return;
        } catch (error) {
            console.error("Firestore eser çekme hatası:", error);
        }
    }
    let yerelEserler = JSON.parse(localStorage.getItem("sanart_eserler") || "[]");
    callback(yerelEserler.reverse());
}

async function eserEkleFirestore(yeniEser) {
    if (db) {
        try {
            await db.collection("eserler").add({
                ...yeniEser,
                tarihMs: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Firestore eser ekleme hatası:", error);
        }
    }
    let eserler = JSON.parse(localStorage.getItem("sanart_eserler") || "[]");
    eserler.push(yeniEser);
    localStorage.setItem("sanart_eserler", JSON.stringify(eserler));
    return true;
}

async function begeniGuncelleFirestore(eserId, yeniBegenenler) {
    if (db) {
        try {
            await db.collection("eserler").doc(String(eserId)).update({
                begenenler: yeniBegenenler
            });
            return;
        } catch (error) {
            console.error("Firestore beğeni güncelleme hatası:", error);
        }
    }
    let eserler = JSON.parse(localStorage.getItem("sanart_eserler") || "[]");
    let eser = eserler.find(e => String(e.id) === String(eserId));
    if (eser) {
        eser.begenenler = yeniBegenenler;
        localStorage.setItem("sanart_eserler", JSON.stringify(eserler));
    }
}

async function yorumEkleFirestore(eserId, yeniYorumlar) {
    if (db) {
        try {
            await db.collection("eserler").doc(String(eserId)).update({
                yorumlar: yeniYorumlar
            });
            return;
        } catch (error) {
            console.error("Firestore yorum ekleme hatası:", error);
        }
    }
    let eserler = JSON.parse(localStorage.getItem("sanart_eserler") || "[]");
    let eser = eserler.find(e => String(e.id) === String(eserId));
    if (eser) {
        eser.yorumlar = yeniYorumlar;
        localStorage.setItem("sanart_eserler", JSON.stringify(eserler));
    }
}

async function duyurulariGetir(callback) {
    if (db) {
        try {
            let snapshot = await db.collection("duyurular").orderBy("tarihMs", "desc").get();
            let duyurular = [];
            snapshot.forEach(doc => duyurular.push({ id: doc.id, ...doc.data() }));
            callback(duyurular);
            return;
        } catch (e) { console.error(e); }
    }
    callback(JSON.parse(localStorage.getItem("sanart_duyurular") || "[]"));
}

async function etkinlikleriGetir(callback) {
    if (db) {
        try {
            let snapshot = await db.collection("etkinlikler").orderBy("tarihMs", "desc").get();
            let etkinlikler = [];
            snapshot.forEach(doc => etkinlikler.push({ id: doc.id, ...doc.data() }));
            callback(etkinlikler);
            return;
        } catch (e) { console.error(e); }
    }
    callback(JSON.parse(localStorage.getItem("sanart_etkinlikler") || "[]"));
}

window.addEventListener('DOMContentLoaded', function() {
    var aktif = localStorage.getItem("sanart_kullanici");
    if (aktif && aktif !== "Misafir") {
        let profilMetin = document.getElementById('altMenuProfilMetin');
        let profilHarf = document.getElementById('altMenuAvatarHarf');
        if(profilMetin) profilMetin.innerText = aktif;
        if(profilHarf) profilHarf.innerText = aktif.charAt(0).toUpperCase();
    } else {
        let profilMetin = document.getElementById('altMenuProfilMetin');
        if(profilMetin) profilMetin.innerText = "Profil";
    }
});

