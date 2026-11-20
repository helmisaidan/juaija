(() => {
  'use strict';

  // The prototype intentionally uses browser storage so the demo needs no backend.
  const STORAGE_KEY = 'juaija.app.v1';
  const DEFAULT_USER = {
    id: 'demo-user', username: 'alyarahman', email: 'alya@juaija.my', password: 'juaija123', verified:false,
    bioKey: 'default_demo_bio'
  };
  const categories = [
    { id: 'all', ms: 'Semua barang', en: 'All items' }, { id: 'Books', ms: 'Buku & nota', en: 'Books & notes' },
    { id: 'Electronics', ms: 'Elektronik', en: 'Electronics' }, { id: 'Fashion', ms: 'Fesyen', en: 'Fashion' },
    { id: 'Home', ms: 'Rumah & dorm', en: 'Home & dorm' }, { id: 'Sports', ms: 'Sukan', en: 'Sports' }, { id: 'Other', ms: 'Lain-lain', en: 'Other' }
  ];
  const categoryName = {
    Books: { ms: 'Buku & nota', en: 'Books & notes' }, Electronics: { ms: 'Elektronik', en: 'Electronics' },
    Fashion: { ms: 'Fesyen', en: 'Fashion' }, Home: { ms: 'Rumah & dorm', en: 'Home & dorm' },
    Sports: { ms: 'Sukan', en: 'Sports' }, Other: { ms: 'Lain-lain', en: 'Other' }
  };
  const conditionName = {
    'Like new': { ms: 'Seperti baru', en: 'Like new' }, Good: { ms: 'Baik', en: 'Good' }, Fair: { ms: 'Memuaskan', en: 'Fair' }
  };
  // Seeded campus inventory gives the dashboard and marketplace useful first-run data.
  const sampleListings = [
    ['l01','Calculus: Early Transcendentals','Buku & nota','Books','book-half',38,79,'Like new','Mira N.','Kolej Mawar','Buku rujukan edisi terkini, semua muka surat masih bersih. Sesuai untuk subjek Calculus I & II.','mira'],
    ['l02','Lampu meja minimal','Rumah & dorm','Home','lightbulb',22,45,'Good','Afiq R.','Seksyen 7','Lampu meja dengan tiga tahap kecerahan. Plug USB, berfungsi elok.','afiq'],
    ['l03','Kalkulator Casio fx-570EX','Elektronik','Electronics','calculator',45,89,'Like new','Nadia K.','UiTM Shah Alam','Digunakan untuk satu semester sahaja. Lengkap dengan cover dan kotak.','nadia'],
    ['l04','Cardigan knit warna oat','Fesyen','Fashion','bag',28,65,'Good','Sofia M.','Kolej Dahlia','Saiz M, kain masih lembut dan tak berbulu. Warna neutral senang match.','sofia'],
    ['l05','Study notes: Anatomy','Buku & nota','Books','journal-text',16,32,'Good','Haziq A.','Puncak Alam','Nota ringkas dengan highlight dan rajah. Cover topik semester 1.','haziq'],
    ['l06','Beg tote kanvas tebal','Fesyen','Fashion','bag',14,29,'Like new','Yana F.','Kolej Mawar','Tote bag muat laptop 14 inci dan beberapa buku. Baru pakai dua kali.','yana'],
    ['l07','Keyboard mekanikal 60%','Elektronik','Electronics','keyboard',79,159,'Good','Daniel T.','Seksyen 2','Switch brown, compact dan senyap. Cable USB-C disertakan.','daniel'],
    ['l08','Rak buku mini 3 tingkat','Rumah & dorm','Home','house-door',25,49,'Good','Aina S.','Kolej Perindu','Rak ringan untuk meja belajar atau tepi katil. Mudah dipasang.','aina'],
    ['l09','Jaket denim vintage','Fesyen','Fashion','bag',39,85,'Good','Amir H.','UiTM Shah Alam','Saiz L. Ada sedikit faded pada siku, nampak lebih vintage.','amir'],
    ['l10','Physics workbook sem 2','Buku & nota','Books','book-half',12,24,'Fair','Izzah Z.','Puncak Alam','Ada sedikit conteng pada bab pertama, selebihnya bersih.','izzah'],
    ['l11','Earbuds Bluetooth putih','Elektronik','Electronics','headphones',49,99,'Good','Raihan D.','Seksyen 7','Bateri tahan sekitar 4 jam, casing dan kabel pengecas disertakan.','raihan'],
    ['l12','Cermin meja lipat','Rumah & dorm','Home','house-door',10,21,'Like new','Farah L.','Kolej Mawar','Cermin meja dua sisi. Saiz kecil, sesuai untuk ruang dorm.','farah'],
    ['l13','Dumbbell 2kg (sepasang)','Sukan','Sports','dumbbell',30,55,'Good','Ikmal P.','Seksyen 2','Vinyl coating, masih elok. Harga untuk sepasang.','ikmal'],
    ['l14','Kemeja linen putih','Fesyen','Fashion','bag',24,58,'Like new','Nurin E.','Kolej Dahlia','Saiz S, dipakai sekali untuk presentation.','nurin'],
    ['l15','Novel The Midnight Library','Buku & nota','Books','book-half',18,36,'Good','Syafiq B.','UiTM Shah Alam','Paperback English, halaman lengkap dan tak koyak.','syafiq'],
    ['l16','Mouse wireless senyap','Elektronik','Electronics','mouse',17,35,'Good','Kavitha R.','Puncak Alam','Klik senyap, guna dongle USB. Bateri AA termasuk.','kavitha'],
    ['l17','Kipas USB klip','Rumah & dorm','Home','fan',13,27,'Good','Luqman J.','Kolej Perindu','Kipas tiga kelajuan dengan klip kuat. Sesuai untuk meja.','luqman'],
    ['l18','Jersey futsal biru','Sukan','Sports','bag',20,45,'Fair','Hakim W.','Seksyen 7','Saiz M, nombor masih elok. Boleh serah selepas kelas.','hakim'],
    ['l19','Set highlighter pastel','Buku & nota','Books','pencil',9,19,'Like new','Melati C.','Kolej Mawar','Lima warna pastel, semua dakwat masih penuh.','melati'],
    ['l20','Power bank 10000mAh','Elektronik','Electronics','battery-half',35,69,'Good','Arif M.','UiTM Shah Alam','Dua port USB, kapasiti masih baik. Kabel pendek disertakan.','arif'],
    ['l21','Bakul laundry lipat','Rumah & dorm','Home','basket',11,22,'Good','Jia W.','Kolej Dahlia','Boleh lipat bila tak guna, ringan dan tak makan ruang.','jia'],
    ['l22','Seluar slack hitam','Fesyen','Fashion','bag',25,52,'Good','Nabila O.','Seksyen 2','Pinggang 28, potongan straight. Sudah dicuci kering.','nabila'],
    ['l23','Raket badminton beginner','Sukan','Sports','trophy',27,54,'Good','Faiz S.','Puncak Alam','Ringan dan sesuai untuk latihan santai. Grip baru ditukar.','faiz'],
    ['l24','Pokok pothos + pasu','Lain-lain','Other','house-door',15,28,'Like new','@alyarahman','UiTM Shah Alam','Pokok mudah jaga untuk tambah hijau dalam bilik. Pasu terracotta termasuk.','demo-user']
  ].map((row, index) => ({
    id: row[0], title: row[1], categoryLabel: row[2], category: row[3], icon: row[4], price: row[5], originalPrice: row[6],
    condition: row[7], seller: row[8], location: row[9], description: row[10], userId: row[11], createdAt: Date.now() - (index * 3 + 2) * 3600_000,
    likes: 14 + ((index * 7) % 53), image: ''
  }));

  // Demo listing copy follows the selected interface language; user-created copy stays as entered.
  const sampleListingTranslations = {
    l01:{ms:{title:'Calculus: Early Transcendentals',description:'Buku rujukan edisi terkini, semua halaman masih bersih. Sesuai untuk subjek Calculus I dan II.'},en:{title:'Calculus: Early Transcendentals',description:'Recent reference edition in clean condition. Suitable for Calculus I and II.'}},
    l02:{ms:{title:'Lampu meja minimal',description:'Lampu meja dengan tiga tahap kecerahan. Plug USB dan masih berfungsi dengan baik.'},en:{title:'Minimal desk lamp',description:'Desk lamp with three brightness levels. USB powered and works well.'}},
    l03:{ms:{title:'Kalkulator Casio fx-570EX',description:'Digunakan untuk satu semester sahaja. Lengkap dengan sarung dan kotak.'},en:{title:'Casio fx-570EX calculator',description:'Used for one semester only. Comes with its cover and box.'}},
    l04:{ms:{title:'Cardigan rajut warna oat',description:'Saiz M, kain masih lembut dan tidak berbulu. Warna neutral mudah dipadankan.'},en:{title:'Oat knit cardigan',description:'Size M, still soft with no pilling. Neutral colour is easy to match.'}},
    l05:{ms:{title:'Nota belajar: Anatomi',description:'Nota ringkas dengan penanda warna dan rajah. Meliputi topik semester pertama.'},en:{title:'Study notes: Anatomy',description:'Concise notes with highlights and diagrams. Covers first-semester topics.'}},
    l06:{ms:{title:'Beg tote kanvas tebal',description:'Beg muat komputer riba 14 inci dan beberapa buku. Baru dipakai dua kali.'},en:{title:'Thick canvas tote bag',description:'Fits a 14-inch laptop and a few books. Worn only twice.'}},
    l07:{ms:{title:'Papan kekunci mekanikal 60%',description:'Suis perang, padat dan senyap. Kabel USB-C disertakan.'},en:{title:'60% mechanical keyboard',description:'Brown switches, compact and quiet. USB-C cable included.'}},
    l08:{ms:{title:'Rak buku mini tiga tingkat',description:'Rak ringan untuk meja belajar atau tepi katil. Mudah dipasang.'},en:{title:'Three-tier mini bookshelf',description:'Lightweight shelf for a study desk or bedside. Easy to assemble.'}},
    l09:{ms:{title:'Jaket denim vintaj',description:'Saiz L. Ada sedikit kesan pudar pada siku untuk gaya vintaj.'},en:{title:'Vintage denim jacket',description:'Size L. Slight fading at the elbows adds a vintage look.'}},
    l10:{ms:{title:'Buku latihan Fizik semester 2',description:'Ada sedikit contengan pada bab pertama; selebihnya masih bersih.'},en:{title:'Physics workbook, semester 2',description:'A few marks in the first chapter; the rest is clean.'}},
    l11:{ms:{title:'Fon telinga Bluetooth putih',description:'Bateri tahan kira-kira empat jam. Sarung pengecas dan kabel disertakan.'},en:{title:'White Bluetooth earbuds',description:'Battery lasts about four hours. Charging case and cable included.'}},
    l12:{ms:{title:'Cermin meja lipat',description:'Cermin meja dua sisi. Saiz kecil, sesuai untuk ruang asrama.'},en:{title:'Foldable tabletop mirror',description:'Double-sided tabletop mirror. Compact and suited to a dorm room.'}},
    l13:{ms:{title:'Dumbel 2 kg (sepasang)',description:'Bersalut vinil dan masih elok. Harga untuk sepasang.'},en:{title:'2 kg dumbbells (pair)',description:'Vinyl-coated and in good condition. Price is for the pair.'}},
    l14:{ms:{title:'Kemeja linen putih',description:'Saiz S, dipakai sekali sahaja untuk pembentangan.'},en:{title:'White linen shirt',description:'Size S, worn once for a presentation.'}},
    l15:{ms:{title:'Novel The Midnight Library',description:'Edisi kulit lembut dalam bahasa Inggeris, halaman lengkap dan tidak koyak.'},en:{title:'The Midnight Library novel',description:'English paperback with all pages intact and no tears.'}},
    l16:{ms:{title:'Tetikus tanpa wayar senyap',description:'Klik senyap dan menggunakan penerima USB. Bateri AA disertakan.'},en:{title:'Quiet wireless mouse',description:'Silent clicks and uses a USB receiver. AA battery included.'}},
    l17:{ms:{title:'Kipas USB klip',description:'Kipas tiga kelajuan dengan klip kukuh. Sesuai untuk meja.'},en:{title:'Clip-on USB fan',description:'Three-speed fan with a sturdy clip. Great for a desk.'}},
    l18:{ms:{title:'Jersi futsal biru',description:'Saiz M, nombor masih elok. Boleh diserahkan selepas kelas.'},en:{title:'Blue futsal jersey',description:'Size M with the number still in good condition. Handoff after class is possible.'}},
    l19:{ms:{title:'Set pen penanda pastel',description:'Lima warna pastel, semuanya masih penuh dakwat.'},en:{title:'Pastel highlighter set',description:'Five pastel colours, all with plenty of ink.'}},
    l20:{ms:{title:'Bank kuasa 10,000 mAh',description:'Dua port USB dan kapasiti bateri masih baik. Kabel pendek disertakan.'},en:{title:'10,000 mAh power bank',description:'Two USB ports and battery capacity is still good. Short cable included.'}},
    l21:{ms:{title:'Bakul dobi lipat',description:'Boleh dilipat apabila tidak digunakan. Ringan dan menjimatkan ruang.'},en:{title:'Foldable laundry basket',description:'Folds away when not in use. Lightweight and space-saving.'}},
    l22:{ms:{title:'Seluar slack hitam',description:'Pinggang 28 inci dengan potongan lurus. Sudah dicuci kering.'},en:{title:'Black slacks',description:'28-inch waist with a straight cut. Dry-cleaned.'}},
    l23:{ms:{title:'Raket badminton untuk pemula',description:'Ringan dan sesuai untuk latihan santai. Grip baru sahaja ditukar.'},en:{title:'Beginner badminton racket',description:'Lightweight and suited to casual practice. The grip was just replaced.'}},
    l24:{ms:{title:'Pokok pothos dan pasu',description:'Pokok mudah dijaga untuk menghijaukan bilik. Pasu terakota disertakan.'},en:{title:'Pothos plant and pot',description:'An easy-care plant to add greenery to a room. Terracotta pot included.'}}
  };
  const sampleLocationTranslations = {
    l01:{ms:'Kolej Mawar',en:'Mawar College'},l02:{ms:'Seksyen 7',en:'Section 7'},l03:{ms:'UiTM Shah Alam',en:'UiTM Shah Alam'},
    l04:{ms:'Kolej Dahlia',en:'Dahlia College'},l05:{ms:'Puncak Alam',en:'Puncak Alam'},l06:{ms:'Kolej Mawar',en:'Mawar College'},
    l07:{ms:'Seksyen 2',en:'Section 2'},l08:{ms:'Kolej Perindu',en:'Perindu College'},l09:{ms:'UiTM Shah Alam',en:'UiTM Shah Alam'},
    l10:{ms:'Puncak Alam',en:'Puncak Alam'},l11:{ms:'Seksyen 7',en:'Section 7'},l12:{ms:'Kolej Mawar',en:'Mawar College'},
    l13:{ms:'Seksyen 2',en:'Section 2'},l14:{ms:'Kolej Dahlia',en:'Dahlia College'},l15:{ms:'UiTM Shah Alam',en:'UiTM Shah Alam'},
    l16:{ms:'Puncak Alam',en:'Puncak Alam'},l17:{ms:'Kolej Perindu',en:'Perindu College'},l18:{ms:'Seksyen 7',en:'Section 7'},
    l19:{ms:'Kolej Mawar',en:'Mawar College'},l20:{ms:'UiTM Shah Alam',en:'UiTM Shah Alam'},l21:{ms:'Kolej Dahlia',en:'Dahlia College'},
    l22:{ms:'Seksyen 2',en:'Section 2'},l23:{ms:'Puncak Alam',en:'Puncak Alam'},l24:{ms:'UiTM Shah Alam',en:'UiTM Shah Alam'}
  };

  // UI copy is kept in one place so the BM/English switch stays consistent.
  const messages = {
    ms: {
      home_eyebrow:'KHAMIS, 19 NOVEMBER', made_with_care:'Dibuat dengan hati untuk pelajar.', title_placeholder:'Contoh: Kalkulator Casio fx-570EX', original_placeholder:'Pilihan', description_placeholder:'Ceritakan keadaan barang, sebab dijual, atau apa-apa yang pembeli patut tahu...', location_placeholder:'Contoh: Kolej Mawar, UiTM Shah Alam',
      tagline:'Barang baik, harga pelajar.', nav_home:'Ringkasan', nav_explore:'Teroka', nav_sell:'Jual barang', orders:'Pesanan', verify_student:'Pengesahan pelajar', your_orders:'PESANAN AWAK', all_orders:'Semua pesanan', active_orders:'Sedang berjalan', completed_orders:'Selesai', no_orders:'Belum ada pesanan', orders_empty_copy:'Pesanan yang dibuat akan muncul di sini.', order_seller:'Penjual', order_buyer:'Pembeli', order_pending:'Menunggu', order_done:'Selesai', item_unavailable:'Barang tidak tersedia', student_safety:'KESELAMATAN KOMUNITI', student_email:'E-mel pelajar UiTM', verify_button:'Sahkan e-mel', verification_warning:'Pengesahan ini berdasarkan format e-mel sahaja dan bukan semakan kewujudan peti masuk. Lencana boleh ditarik balik jika e-mel didapati tidak sah.', verification_complete:'E-mel pelajar disahkan', verify_intro:'Sahkan status pelajar dengan e-mel UiTM yang menggunakan 10 angka matrik.', verification_email_error:'Gunakan format 10 angka@student.uitm.edu.my.', verification_saved:'E-mel pelajar berjaya disahkan.', my_overview:'Ringkasan akaun', my_listings:'Iklan saya', my_orders:'Pesanan saya', order_created:'Pesanan ditambah. Hubungi penjual untuk urusan serahan.', account_exists:'Sudah ada akaun?', listings:'Senarai', your_listings:'Senarai awak', hello:'Hai', home_intro:'Jom tengok apa yang bergerak dekat komuniti kampus minggu ni.', start_selling:'Mula menjual', community_badge:'KOMUNITI KAMPUS · LIVE', hero_kicker:'Barang lama, peluang baru.', hero_title:'Jual barang terpakai<br><em>dengan mudah.</em>', hero_desc:'Jual apa yang dah tak guna, cari apa yang diperlukan - dengan harga yang lebih mesra poket pelajar.', browse_market:'Teroka pasaran', less_waste:'kurang pembaziran', overview_label:'PAPARAN KOMUNITI', community_overview:'Ringkasan komuniti', updated_now:'Dikemas kini sebentar tadi', active_iklans:'Senarai aktif', saved_by_pelajars:'Penjimatan pelajar', successful_handoffs:'Urus niaga selesai', items_given_life:'Barang diberi nafas baru', items:'barang', little_by_little:'Sikit-sikit, banyak makna.', vs_last_week:'berbanding minggu lepas', this_month:'bulan ini', market_pulse:'AKTIVITI PASARAN', activity_trend:'Aktiviti pasaran', week:'Minggu', month:'Bulan', new_iklans:'Senarai baharu', pelajar_savings:'Penjimatan pelajar', saved_this_week:'disimpan minggu ini', chart_insight:'Aktiviti jual beli paling tinggi pada hari Rabu. Masa terbaik untuk senaraikan barang!', trending_now:'SEDANG TRENDING', top_categories:'Kategori pilihan', category_activity:'Paling aktif di sekitar kampus.', category_note:'Buku & nota paling cepat bertukar tangan minggu ini.', picked_for_you:'DIPILIH UNTUK AWAK', fresh_finds:'Barang menarik dekat sini', see_all:'Lihat semua', pasaran_label:'PASARAN', find_a_good_thing:'Cari barang baik.', explore_intro:'Barang terpakai, harga masuk akal, dekat dengan awak.', sell_an_item:'Jual barang', search_placeholder:'Cari buku, lampu, baju...', sort_by:'Susun:', sort_newest:'Terbaru', sort_price_low:'Harga terendah', sort_price_high:'Harga tertinggi', sort_popular:'Paling diminati', show:'Papar', nothing_found:'Tak jumpa barang yang sepadan.', try_other_search:'Cuba kata kunci atau kategori lain.', clear_filters:'Kosongkan carian', seller_studio:'RUANG PENJUAL', sell_something:'Jual barang. Buka ruang.', sell_intro:'Barang yang dah tak digunakan mungkin benda yang orang lain perlukan.', seller_tip:'Iklan dengan gambar jelas terjual dua kali lebih cepat.', item_details:'Butiran barang', required_fields:'Medan bertanda * wajib diisi.', item_title:'Nama barang *', category:'Kategori *', choose_category:'Pilih kategori', condition:'Keadaan *', choose_condition:'Pilih keadaan', selling_price:'Harga jual (RM) *', original_price:'Harga asal (RM)', description:'Penerangan *', pickup_location:'Lokasi serahan *', item_photo:'Gambar barang', add_photo:'Tambah gambar', photo_hint:'JPG, PNG · maks 2 MB', seller_privacy:'Maklumat hubungan peribadi tak dipaparkan.', publish_iklan:'Terbitkan iklan', your_impact:'IMPAK AWAK', items_on_market:'barang awak di pasaran', sell_encouragement:'Setiap barang yang dijual bantu orang lain berjimat dan kurangkan pembaziran.', earnings:'Potensi hasil', quick_tip:'TIP RINGKAS', tip_title:'Ceritakan kisah barang.', tip_desc:'Jujur tentang keadaan barang dan letak harga berpatutan. Pembeli suka tahu apa yang mereka dapat.', community_member:'AHLI KOMUNITI juaija', your_profile:'PROFIL AWAK', edit_profile:'Edit profil', iklans:'Senarai', items_sold:'Terjual', seller_rating:'Rating penjual', member_since:'Ahli sejak 2024', your_corner:'SUDUT AWAK', your_iklans:'Senarai awak', add_new:'Tambah baru', trusted_seller:'PENJUAL DIPERCAYAI', good_karma:'Kedudukan penjual', karma_copy:'Rating tinggi, urusan lancar. Teruskan jadi sebahagian daripada komuniti yang baik.', bookmarked:'DISIMPAN', saved_items:'Barang simpanan', find_more:'Cari lagi', your_updates:'KEMAS KINI', notifications:'Notifikasi', notification_intro:'Perkara terbaru daripada komuniti juaija.', mark_all_read:'Tandakan semua dibaca', all_updates:'Semua', unread:'Belum dibaca', good_things_happen:'PERKARA BAIK BERLAKU', notification_note_title:'Satu barang kecil, lega sikit hujung bulan.', notification_note_body:'Setiap urusan di juaija bantu kita berjimat dan guna semula apa yang ada.', explore_market:'Teroka pasaran', make_it_yours:'PILIHAN AWAK', settings:'Tetapan', settings_intro:'Laraskan juaija ikut cara yang paling selesa untuk awak.', appearance:'Penampilan', appearance_desc:'Pilih suasana yang selesa untuk mata.', light:'Cerah', dark:'Gelap', language:'Bahasa', language_desc:'Bahasa pilihan untuk seluruh pengalaman.', account:'Akaun', account_desc:'Butiran akaun demo disimpan pada peranti ini.', privacy:'Privasi & data', privacy_desc:'Maklumat peribadi dan penggunaan platform.', privacy_terms_note:'Data profil hanya digunakan untuk urusan juaija. Pengguna bertanggungjawab memastikan maklumat dan iklan adalah tepat serta mematuhi undang-undang.', reset_demo:'Reset data demo', sign_out:'Log keluar', settings_card_title:'Biar sederhana.<br>Biar berbaloi.', settings_card_body:'Dibina untuk komuniti yang berkongsi ruang, sumber dan peluang.', crafted_for_pelajars:'Direka dengan hati untuk komuniti kampus.', footer_tagline:'Barang baik, harga pelajar.', footer_note:'Beri barang peluang kedua. Bantu pelajar berjimat.', explore:'Teroka', sell:'Jual', made_for_kampus:'Dibuat untuk komuniti kampus', buy_sell_repeat:'Beli. Jual. Ulang semula.', profile:'Profil', auth_kicker:'KOMUNITI YANG BERBALOI', auth_visual_title:'Barang baik<br>tak patut membazir.', auth_visual_desc:'Satu jualan kecil boleh beri ruang bernafas pada orang lain.', welcome_back:'SELAMAT KEMBALI', auth_title:'Masuk ke juaija', auth_intro:'Teruskan cari barang yang berbaloi.', login_identity_placeholder:'Masukkan username atau e-mel', login_password_placeholder:'Masukkan kata laluan', quick_access:'Akses pantas', saved_on_device:'Akaun anda disimpan pada peranti ini', continue_saved_account:'Teruskan dengan akaun tersimpan', username:'USERNAME', username_or_email:'Nama pengguna atau e-mel', username_label:'Nama pengguna', saved_login:'Butiran log masuk', saved_login_hint:'Gunakan akaun ini untuk demonstrasi', continue_demo:'Teruskan sebagai akaun ini', password:'Kata laluan', sign_in:'Masuk', sign_in_title:'Log Masuk', about:'Tentang', terms:'Terma', lecturer_demo:'Akaun demo pensyarah', ready_to_use:'Sedia untuk terus digunakan', active:'AKTIF', demo_username:'USERNAME', demo_password:'PASSWORD', continue_as_demo:'Teruskan dengan akaun demo', or:'atau', new_to_juaija:'Baru di juaija?', create_account:'Cipta akaun', unique_username:'Username unik', email:'E-mel', password_min:'Kata laluan (min. 8 aksara)', local_demo_notice:'Akaun projek ini disimpan secara setempat untuk tujuan demonstrasi.', auth_bad_credentials:'Username/e-mel atau kata laluan tak tepat.', auth_unique_username:'Username ini sudah digunakan.', auth_unique_email:'E-mel ini sudah digunakan.', auth_username_rules:'Gunakan 3-20 aksara: huruf kecil, nombor, titik atau garis bawah. Tidak boleh berakhir dengan titik atau menggunakan dua titik berturutan.', auth_email_invalid:'Masukkan alamat e-mel yang sah.', auth_password_short:'Kata laluan perlu sekurang-kurangnya 8 aksara.', auth_login_ok:'Selamat datang ke juaija.', iklan_created:'Iklan berjaya diterbitkan!', iklan_title_error:'Nama barang perlu diisi (maks. 60 aksara).', iklan_category_error:'Pilih kategori barang.', iklan_condition_error:'Pilih keadaan barang.', iklan_price_error:'Masukkan harga jual yang sah (lebih daripada RM0).', iklan_original_error:'Harga asal mesti sama atau lebih tinggi daripada harga jual.', iklan_description_error:'Penerangan perlu diisi (maks. 500 aksara).', iklan_location_error:'Masukkan lokasi serahan.', image_type_error:'Pilih imej JPG, PNG atau WebP.', image_size_error:'Saiz gambar maksimum ialah 2 MB.', image_read_error:'Gambar tak dapat dibaca. Cuba fail lain.', storage_error:'Ruang simpanan browser penuh. Cuba gambar lebih kecil atau padam iklan.', saved_toast:'Barang disimpan untuk kemudian.', unsaved_toast:'Barang dibuang daripada simpanan.', contact_sent:'Mesej minat dihantar kepada penjual (simulasi demo).', profile_saved:'Profil berjaya dikemas kini.', reset_confirm:'Reset semua data demo dalam browser ini? Perubahan tempatan akan hilang.', reset_done:'Data demo dipulihkan.', marked_read:'Semua notifikasi ditandakan dibaca.', copied:'Butiran demo disalin.', demo_user_label:'Akaun demo', demo_iklan:'Iklan demo', state_like_new:'Seperti baru', state_good:'Baik', state_fair:'Memuaskan', edit_your_profile:'Edit profil awak', full_name:'Nama paparan', kampus:'Kampus / lokasi', short_bio:'Bio ringkas', cancel:'Batal', save_changes:'Simpan perubahan', details:'Butiran barang', interested:'Saya berminat', contact_simulated:'Hubungi penjual', condition_label:'Keadaan', location_label:'Lokasi serahan', seller_label:'Penjual', likes_label:'diminati', page_items:'barang', showing:'Menunjukkan', of:'daripada', page:'Halaman', marked:'DIBACA', new_notification_iklan:'Iklan baru mungkin menarik minat awak.', notif_demo_title:'Selamat datang ke juaija!', notif_demo_body:'Jom beri barang lama peluang kedua. Akaun demo awak sudah sedia.', notif_trend_title:'Buku & nota sedang trending', notif_trend_body:'Kategori ini paling aktif minggu ini - banyak barang berbaloi baru masuk.', notif_saved_title:'Simpanan awak menanti', notif_saved_body:'Simpan barang kegemaran supaya senang dicari semula.', joined_now:'Baru sahaja', hours_ago:'jam lepas', days_ago:'hari lepas', read_more:'Tandakan dibaca', change_saved:'Tetapan disimpan.', selling_price_short:'Harga jual', sort_oldest:'Terlama'
    },
    en: {
      home_eyebrow:'THURSDAY, NOVEMBER 19', made_with_care:'Thoughtfully made for students.', title_placeholder:'e.g. Casio fx-570EX calculator', original_placeholder:'Optional', description_placeholder:'Describe the item, why you’re selling it, or anything a buyer should know...', location_placeholder:'e.g. Mawar College, UiTM Shah Alam',
      tagline:'Good finds, student prices.', nav_home:'Overview', nav_explore:'Explore', nav_sell:'Sell an item', orders:'Orders', verify_student:'Student verification', your_orders:'YOUR ORDERS', all_orders:'All orders', active_orders:'In progress', completed_orders:'Completed', no_orders:'No orders yet', orders_empty_copy:'Orders you place will appear here.', order_seller:'Seller', order_buyer:'Buyer', order_pending:'Pending', order_done:'Completed', item_unavailable:'Item unavailable', student_safety:'COMMUNITY SAFETY', student_email:'UiTM student email', verify_button:'Verify email', verification_warning:'This verification checks the email format only; it does not confirm mailbox ownership. The badge may be removed if the email is found to be invalid.', verification_complete:'Student email verified', verify_intro:'Verify your student status with a UiTM email using your 10-digit matric number.', verification_email_error:'Use the format 10 digits@student.uitm.edu.my.', verification_saved:'Student email verified.', my_overview:'Account summary', my_listings:'My listings', my_orders:'My orders', order_created:'Order added. Contact the seller to arrange handoff.', account_exists:'Already have an account?', hello:'Hey', home_intro:'Here’s what’s moving around the campus community this week.', start_selling:'Start selling', community_badge:'CAMPUS COMMUNITY · LIVE', hero_kicker:'Old things, new chances.', hero_title:'Sell pre-loved goods<br><em>with ease.</em>', hero_desc:'Sell what you no longer need, find what you do - at prices made for student budgets.', browse_market:'Explore marketplace', less_waste:'less waste', overview_label:'COMMUNITY SNAPSHOT', community_overview:'Community overview', updated_now:'Updated just now', active_listings:'Active listings', saved_by_students:'Student savings', successful_handoffs:'Successful handoffs', items_given_life:'Items given new life', items:'items', little_by_little:'Small things add up.', vs_last_week:'vs last week', this_month:'this month', market_pulse:'MARKETPLACE PULSE', activity_trend:'Marketplace activity', week:'Week', month:'Month', new_listings:'New listings', student_savings:'Student savings', saved_this_week:'saved this week', chart_insight:'Buying and selling peaked on Wednesday. A great time to list something!', trending_now:'TRENDING NOW', top_categories:'Popular categories', category_activity:'Most active around campus.', category_note:'Books & notes changed hands fastest this week.', picked_for_you:'PICKED FOR YOU', fresh_finds:'Good finds nearby', see_all:'See all', marketplace_label:'MARKETPLACE', find_a_good_thing:'Find a good thing.', explore_intro:'Pre-loved finds, fair prices, right around you.', sell_an_item:'Sell an item', search_placeholder:'Search books, lamps, clothes...', sort_by:'Sort:', sort_newest:'Newest', sort_price_low:'Price: low to high', sort_price_high:'Price: high to low', sort_popular:'Most liked', show:'Show', nothing_found:'No matching items found.', try_other_search:'Try another search term or category.', clear_filters:'Clear filters', seller_studio:'SELLER STUDIO', sell_something:'Sell a thing. Make room.', sell_intro:'Something you no longer use might be exactly what someone needs.', seller_tip:'Listings with clear photos sell 2× faster.', item_details:'Item details', required_fields:'Fields marked * are required.', item_title:'Item name *', category:'Category *', choose_category:'Choose a category', condition:'Condition *', choose_condition:'Choose condition', selling_price:'Selling price (RM) *', original_price:'Original price (RM)', description:'Description *', pickup_location:'Pickup location *', item_photo:'Item photo', add_photo:'Add a photo', photo_hint:'JPG, PNG · max 2 MB', seller_privacy:'Your personal contact details stay private.', publish_listing:'Publish listing', your_impact:'YOUR IMPACT', items_on_market:'of your items on the marketplace', sell_encouragement:'Every item sold helps someone save and keeps good things in use.', earnings:'Potential earnings', quick_tip:'QUICK TIP', tip_title:'Tell its little story.', tip_desc:'Be honest about condition and price it fairly. Buyers like knowing exactly what they’ll get.', community_member:'juaija COMMUNITY MEMBER', your_profile:'YOUR PROFILE', edit_profile:'Edit profile', listings:'Listings', items_sold:'Sold', seller_rating:'Seller rating', member_since:'Member since 2024', your_corner:'YOUR CORNER', your_listings:'Your listings', add_new:'Add new', trusted_seller:'TRUSTED SELLER', good_karma:'Good karma score', karma_copy:'Great ratings and smooth handoffs. Keep being part of a good community.', bookmarked:'BOOKMARKED', saved_items:'Saved items', find_more:'Find more', your_updates:'YOUR UPDATES', notifications:'Notifications', notification_intro:'The latest from the juaija community.', mark_all_read:'Mark all as read', all_updates:'All', unread:'Unread', good_things_happen:'GOOD THINGS HAPPEN', notification_note_title:'One small find can ease the end of the month.', notification_note_body:'Every juaija exchange helps us save and reuse what we already have.', explore_market:'Explore marketplace', make_it_yours:'MAKE IT YOURS', settings:'Settings', settings_intro:'Tune juaija to feel just right for you.', appearance:'Appearance', appearance_desc:'Choose the look that feels easy on your eyes.', light:'Light', dark:'Dark', language:'Language', language_desc:'Your preferred language across juaija.', account:'Account', account_desc:'Demo account details are stored on this device.', privacy:'Privacy & data', privacy_desc:'Personal information and platform use.', privacy_terms_note:'Profile data is used only for juaija. Users are responsible for ensuring information and listings are accurate and lawful.', reset_demo:'Reset demo data', sign_out:'Sign out', settings_card_title:'Keep it simple.<br>Make it count.', settings_card_body:'Made for a community that shares space, resources and opportunity.', crafted_for_students:'Thoughtfully made for campus communities.', footer_tagline:'Good finds, student prices.', footer_note:'Give good things a second life. Help students save.', explore:'Explore', sell:'Sell', made_for_campus:'Made for campus communities', buy_sell_repeat:'Buy. Sell. Repeat.', profile:'Profile', auth_kicker:'A COMMUNITY THAT ADDS UP', auth_visual_title:'Good things<br>shouldn’t go to waste.', auth_visual_desc:'One small sale can give someone else a little breathing room.', welcome_back:'WELCOME BACK', auth_title:'Sign in to juaija', auth_intro:'Keep finding things that are worth it.', username_or_email:'Username or email', username_label:'Username', saved_login:'Sign-in details', saved_login_hint:'Use this account for the demonstration', continue_demo:'Continue with this account', password:'Password', sign_in:'Sign in', sign_in_title:'Sign in', about:'About', terms:'Terms', lecturer_demo:'Lecturer demo account', ready_to_use:'Ready to use right away', active:'ACTIVE', demo_username:'USERNAME', demo_password:'PASSWORD', continue_as_demo:'Continue with demo account', or:'or', new_to_juaija:'New to juaija?', create_account:'Create account', unique_username:'Unique username', email:'Email', password_min:'Password (min. 8 characters)', local_demo_notice:'This project account is stored locally for demonstration.', auth_bad_credentials:'That username/email or password is incorrect.', auth_unique_username:'This username is already taken.', auth_unique_email:'This email is already in use.', auth_username_rules:'Use 3-20 characters: letters, numbers or underscores.', auth_email_invalid:'Enter a valid email address.', auth_password_short:'Password must be at least 8 characters.', auth_login_ok:'Welcome to juaija.', listing_created:'Listing published!', listing_title_error:'Enter an item name (up to 60 characters).', listing_category_error:'Choose an item category.', listing_condition_error:'Choose an item condition.', listing_price_error:'Enter a valid selling price (over RM0).', listing_original_error:'Original price must be equal to or higher than the selling price.', listing_description_error:'Enter a description (up to 500 characters).', listing_location_error:'Enter a pickup location.', image_type_error:'Choose a JPG, PNG or WebP image.', image_size_error:'Maximum image size is 2 MB.', image_read_error:'Could not read that image. Try another file.', storage_error:'Browser storage is full. Try a smaller image or remove a listing.', saved_toast:'Item saved for later.', unsaved_toast:'Item removed from saved items.', contact_sent:'Interest sent to the seller (demo simulation).', profile_saved:'Profile updated.', reset_confirm:'Reset all demo data in this browser? Local changes will be lost.', reset_done:'Demo data restored.', marked_read:'All notifications marked as read.', copied:'Demo details copied.', demo_user_label:'Demo account', demo_listing:'Demo listing', state_like_new:'Like new', state_good:'Good', state_fair:'Fair', edit_your_profile:'Edit your profile', full_name:'Display name', campus:'Campus / location', short_bio:'Short bio', cancel:'Cancel', save_changes:'Save changes', details:'Item details', interested:'I’m interested', contact_simulated:'Contact seller', condition_label:'Condition', location_label:'Pickup location', seller_label:'Seller', likes_label:'likes', page_items:'items', showing:'Showing', of:'of', page:'Page', marked:'READ', new_notification_listing:'A new listing you might like.', notif_demo_title:'Welcome to juaija!', notif_demo_body:'Give good things a second life. Your demo account is ready.', notif_trend_title:'Books & notes are trending', notif_trend_body:'This category is most active this week - more good finds just arrived.', notif_saved_title:'Your saved finds are waiting', notif_saved_body:'Save your favourites so they’re easy to find later.', joined_now:'Just now', hours_ago:'hours ago', days_ago:'days ago', read_more:'Mark as read', change_saved:'Settings saved.', selling_price_short:'Selling price', sort_oldest:'Oldest'
    }
  };

  // Keep every copy key available in both supported languages, including legacy keys in saved UI state.
  Object.assign(messages.ms, {
    aksara:'aksara', demo_listing:'Iklan demo', listing_created:'Iklan berjaya diterbitkan!',
    made_for_campus:'Dibuat untuk komuniti kampus', new_notification_listing:'Iklan baharu yang mungkin awak suka.',
    active_listings:'Senarai aktif', saved_by_students:'Penjimatan pelajar', new_listings:'Senarai baharu', student_savings:'Penjimatan pelajar',
    marketplace_label:'PASARAN', publish_listing:'Terbitkan iklan', crafted_for_students:'Direka khas untuk komuniti kampus.',
    listing_title_error:'Masukkan nama barang (maksimum 60 aksara).', listing_category_error:'Pilih kategori barang.',
    listing_condition_error:'Pilih keadaan barang.', listing_price_error:'Masukkan harga jual yang sah (lebih daripada RM0).',
    listing_original_error:'Harga asal mesti sama atau lebih tinggi daripada harga jual.',
    listing_description_error:'Masukkan penerangan (maksimum 500 aksara).', listing_location_error:'Masukkan lokasi serahan.',
    campus:'Kampus', characters:'aksara', close:'Tutup', close_dialog:'Tutup dialog', time_now:'sekarang',
    save_item:'Simpan barang', remove_saved:'Buang daripada simpanan', percent_less:'lebih murah', saved_empty:'Barang simpanan akan muncul di sini.',
    caught_up:'Semua notifikasi sudah dibaca!', notifications_empty:'Notifikasi baharu akan muncul di sini.',
    show_password:'Lihat kata laluan', hide_password:'Sembunyikan kata laluan', account_exists:'Dah ada akaun?',
    account_created:'Akaun berjaya dicipta. Selamat datang!', new_member_bio:'Baru menyertai komuniti juaija.',
    default_demo_bio:'Percaya barang baik patut diberi peluang kedua.', listing_live_title:'Iklan awak dah disiarkan!',
    listing_live_body:'{item} kini dipaparkan dalam pasaran.', interest_title:'Berminat dengan {item}',
    interest_body:'Awak menunjukkan minat pada {item}. Hubungi {seller} untuk mengatur serahan.',
    sort_listings:'Susun iklan', view_modes:'Paparan', grid_view:'Paparan grid', list_view:'Paparan senarai',
    main_navigation:'Navigasi utama', mobile_navigation:'Navigasi mudah alih', home_link:'Laman utama juaija',
    search_items:'Cari barang', chart_period:'Tempoh carta', chart_activity:'Carta trend aktiviti pasaran',
    see_items:'Lihat barang', explore_categories:'Teroka kategori', previous_page:'Halaman sebelumnya',
    next_page:'Halaman seterusnya', login_or_signup:'Log masuk atau cipta akaun',
    meta_description:'Pasaran kampus untuk memberi barang terpakai peluang kedua dan membantu pelajar berjimat.',
    og_title:'juaija - Barang baik, harga pelajar', og_description:'Cari barang terpakai dekat kampus, jual dengan mudah dan berjimat lebih banyak.',
    page_title:'juaija - Barang baik, harga pelajar', username_placeholder:'contoh: namapengguna', username_rules_hint:'3–20 aksara: huruf, nombor, titik (.) atau garis bawah (_). Titik hanya di tengah dan tidak berturutan.',
    password_placeholder:'Kata laluan sekurang-kurangnya 8 aksara', account_desc:'', unique_username:'Nama pengguna'
  });
  Object.assign(messages.en, {
    active_iklans:'Active listings', aksara:'characters', continue_saved_account:'Continue with saved account',
    crafted_for_pelajars:'Thoughtfully made for campus communities.', demo_iklan:'Demo listing',
    iklan_category_error:'Choose an item category.', iklan_condition_error:'Choose an item condition.',
    iklan_created:'Listing published!', iklan_description_error:'Enter a description (up to 500 characters).',
    iklan_location_error:'Enter a pickup location.', iklan_original_error:'Original price must be equal to or higher than the selling price.',
    iklan_price_error:'Enter a valid selling price (over RM0).', iklan_title_error:'Enter an item name (up to 60 characters).',
    iklans:'Listings', kampus:'Campus', login_identity_placeholder:'Enter your username or email',
    login_password_placeholder:'Enter your password', made_for_kampus:'Made for campus communities', new_iklans:'New listings',
    new_notification_iklan:'A new listing you might like.', pasaran_label:'MARKETPLACE', pelajar_savings:'Student savings',
    publish_iklan:'Publish listing', quick_access:'Quick access', saved_by_pelajars:'Student savings',
    saved_on_device:'Your account is saved on this device', username:'USERNAME', your_iklans:'Your listings',
    campus:'Campus', characters:'characters', close:'Close', close_dialog:'Close dialog', time_now:'now',
    save_item:'Save item', remove_saved:'Remove from saved items', percent_less:'less', saved_empty:'Saved items will appear here.',
    caught_up:'You’re all caught up!', notifications_empty:'New notifications will appear here.',
    show_password:'Show password', hide_password:'Hide password', account_exists:'Already have an account?',
    account_created:'Account created. Welcome!', new_member_bio:'New to the juaija community.',
    default_demo_bio:'Believes good things deserve a second chance.', listing_live_title:'Your listing is live!',
    listing_live_body:'{item} is now on the marketplace.', interest_title:'Interested in {item}',
    interest_body:'You showed interest in {item}. Contact {seller} to arrange a handoff.',
    sort_listings:'Sort listings', view_modes:'View options', grid_view:'Grid view', list_view:'List view',
    main_navigation:'Main navigation', mobile_navigation:'Mobile navigation', home_link:'juaija home',
    search_items:'Search items', chart_period:'Chart period', chart_activity:'Marketplace activity chart',
    see_items:'View items', explore_categories:'Explore categories', previous_page:'Previous page',
    next_page:'Next page', login_or_signup:'Sign in or create an account',
    meta_description:'A campus marketplace giving pre-loved items a second life and helping students save.',
    og_title:'juaija - Good finds, student prices', og_description:'Find pre-loved items on campus, sell with ease and save more.',
    page_title:'juaija - Good finds, student prices', username_placeholder:'e.g. username', username_rules_hint:'3–20 characters: letters, numbers, periods (.) or underscores (_). Periods must be between characters and cannot repeat.',
    password_placeholder:'Password must be at least 8 characters', unique_username:'Username',
    auth_username_rules:'Use 3–20 characters: letters, numbers, periods or underscores. Usernames cannot end with a period or contain consecutive periods.'
  });
  Object.assign(messages.ms, {
    community_badge:'KOMUNITI KAMPUS · LANGSUNG', trending_now:'SEDANG POPULAR', quick_tip:'PETUA RINGKAS',
    edit_profile:'Sunting profil', edit_your_profile:'Sunting profil awak', seller_rating:'Penarafan penjual',
    karma_copy:'Penarafan tinggi dan urusan lancar. Teruskan menjadi sebahagian daripada komuniti yang baik.',
    account_desc:'', reset_demo:'Tetapkan semula data contoh',
    login_identity_placeholder:'Masukkan nama pengguna atau e-mel', username:'NAMA PENGGUNA', demo_username:'NAMA PENGGUNA',
    demo_password:'KATA LALUAN', lecturer_demo:'Akaun demonstrasi pensyarah', unique_username:'Nama pengguna',
    auth_bad_credentials:'Nama pengguna/e-mel atau kata laluan tidak tepat.', auth_unique_username:'Nama pengguna ini sudah digunakan.',
    storage_error:'Ruang simpanan pelayar penuh. Cuba gambar lebih kecil atau padam iklan.',
    contact_sent:'Mesej minat dihantar kepada penjual (simulasi).',
    reset_confirm:'Tetapkan semula semua data demonstrasi dalam pelayar ini? Perubahan setempat akan hilang.',
    reset_done:'Data demonstrasi dipulihkan.', copied:'Butiran demonstrasi disalin.', demo_user_label:'Akaun demonstrasi',
    demo_iklan:'Iklan contoh', demo_listing:'Iklan contoh', short_bio:'Biodata ringkas',
    notif_demo_body:'Beri barang lama peluang kedua. Akaun demonstrasi awak sudah sedia.',
    notif_trend_title:'Buku & nota menjadi pilihan',
    notif_trend_body:'Kategori ini paling aktif minggu ini - banyak barang menarik baru tiba.',
    notif_saved_title:'Barang simpanan awak menanti',
    notif_saved_body:'Simpan barang kegemaran supaya mudah dicari semula.',
    listing_created:'Iklan berjaya diterbitkan!', iklan_price_error:'Masukkan harga jual yang sah (lebih daripada RM0).',
    listing_price_error:'Masukkan harga jual yang sah (lebih daripada RM0).',
    iklan_original_error:'Harga asal mesti sama atau lebih tinggi daripada harga jual.',
    listing_original_error:'Harga asal mesti sama atau lebih tinggi daripada harga jual.',
    saved_on_device:'Akaun awak disimpan pada peranti ini', continue_saved_account:'Teruskan dengan akaun tersimpan',
    saved_login_hint:'Gunakan akaun ini untuk demonstrasi', continue_demo:'Teruskan dengan akaun ini',
    continue_as_demo:'Teruskan dengan akaun demonstrasi', copied:'Butiran demonstrasi disalin.',
    account_exists:'Dah ada akaun?', email_placeholder:'nama@email.com', trending_now:'SEDANG DIGEMARI',
    profile_listings_empty:'Belum ada iklan. Awak boleh mulakan dengan iklan pertama.',
    chart_activity:'Carta corak aktiviti pasaran', hour_ago:'jam lepas', day_ago:'hari lepas',
    orders:'Pesanan', your_orders:'PESANAN AWAK', all_orders:'Semua pesanan', active_orders:'Sedang berjalan',
    completed_orders:'Selesai', student_safety:'KESELAMATAN PELAJAR', verify_student:'Pengesahan pelajar',
    student_email:'E-mel pelajar UiTM', verify_button:'Sahkan e-mel',
    verification_warning:'Gunakan e-mel pelajar sendiri yang masih aktif. Sistem menyemak format e-mel; kesahihannya boleh disemak kemudian. Lencana boleh ditarik balik jika e-mel tidak sah atau bukan milik awak.',
    verify_intro:'Sahkan e-mel pelajar UiTM untuk mendapatkan lencana pelajar disahkan.',
    verification_complete:'Akaun pelajar disahkan', item_unavailable:'Barang tidak tersedia', order_seller:'Penjual',
    order_buyer:'Pembeli', order_done:'Selesai', order_pending:'Sedang diproses', no_orders:'Belum ada pesanan',
    orders_empty_copy:'Pesanan barang yang awak beli atau jual akan muncul di sini.', account_activity:'Aktiviti akaun', account_chart_label:'Carta aktiviti akaun mengikut iklan, pesanan dan barang simpanan', my_listings:'Iklan saya', my_orders:'Pesanan saya', saved_items:'Barang simpanan', photo_hint:'JPG, PNG atau WebP · sehingga 4 gambar, jumlah maks 2 MB', gallery_previous:'Gambar sebelumnya', gallery_next:'Gambar seterusnya', gallery_image:'Gambar {current} daripada {total}'
  });
  Object.assign(messages.en, {
    email_placeholder:'name@email.com',hour_ago:'hour ago',day_ago:'day ago',
    profile_listings_empty:'No listings yet. You can start with your first listing.',orders:'Orders',your_orders:'YOUR ORDERS',
    all_orders:'All orders',active_orders:'In progress',completed_orders:'Completed',student_safety:'STUDENT SAFETY',
    verify_student:'Student verification',student_email:'UiTM student email',verify_button:'Verify email',
    verification_warning:'Use your own active student email. The system checks its format; the email may be checked later. The badge may be removed if the address is invalid or does not belong to you.',
    verify_intro:'Verify your UiTM student email to receive a verified student badge.',
    verification_complete:'Student account verified',item_unavailable:'Item unavailable',order_seller:'Seller',order_buyer:'Buyer',
    order_done:'Completed',order_pending:'In progress',no_orders:'No orders yet',
    orders_empty_copy:'Orders for items you buy or sell will appear here.', account_activity:'Account activity', account_chart_label:'Account activity chart for listings, orders, and saved items', my_listings:'My listings', my_orders:'My orders', saved_items:'Saved items', photo_hint:'JPG, PNG or WebP · up to 4 photos, 2 MB total', gallery_previous:'Previous image', gallery_next:'Next image', gallery_image:'Image {current} of {total}'
  });
  Object.assign(messages.ms,{image_size_error:'Jumlah saiz gambar tidak boleh melebihi 2 MB.',image_count_error:'Pilih maksimum empat gambar.'});
  Object.assign(messages.en,{image_size_error:'The total image size cannot exceed 2 MB.',image_count_error:'Choose no more than four images.'});
  Object.assign(messages.ms,{saved_login:'Akaun tersimpan',saved_login_hint:'Gunakan butiran ini untuk log masuk',continue_demo:'Teruskan dengan akaun tersimpan',notif_demo_body:'Selamat datang ke juaija. Mula teroka barang atau terbitkan iklan pertama awak.',account_desc:'',account_week:'7 hari',account_month:'30 hari',activities_recorded:'aktiviti direkodkan',no_recent_activity:'Belum ada aktiviti dalam tempoh ini.',verify_settings_desc:'Sahkan e-mel institusi untuk mendapatkan lencana pelajar.',orders_empty_copy:'Pesanan pembelian dan jualan akan muncul di sini. Teroka barang untuk membuat pesanan pertama.',new_listings:'Iklan baharu',market_items_available:'Barang tersedia',price_difference:'Jumlah diskaun tersedia',activity_period_total:'Jumlah aktiviti dalam {period}',chart_insight_dynamic:'Paling aktif pada {day}: {count} aktiviti.',category_note_dynamic:'Kategori paling banyak diiklankan: {category} ({count}).',no_chart_activity:'Belum ada aktiviti pasaran dalam tempoh ini.',items_handed_over:'Barang selesai diserahkan',verified_student:'Pelajar disahkan',verification_notification_title:'Status pelajar disahkan',verification_notification_body:'E-mel UiTM awak telah disahkan dan lencana pelajar sudah dipaparkan.',order_complete_notification_title:'Pesanan selesai',order_complete_notification_body:'Urusan untuk {item} telah ditandakan selesai.',mark_order_complete:'Tandakan selesai',order_completed:'Pesanan ditandakan selesai.'});
  Object.assign(messages.en,{saved_login:'Saved account',saved_login_hint:'Use these details to sign in',continue_demo:'Continue with saved account',notif_demo_body:'Welcome to juaija. Explore items or publish your first listing.',account_desc:'',account_week:'7 days',account_month:'30 days',activities_recorded:'activities recorded',no_recent_activity:'No activity in this period yet.',verify_settings_desc:'Verify an institutional email to get the student badge.',orders_empty_copy:'Purchases and sales will appear here. Explore items to place your first order.',new_listings:'New listings',market_items_available:'Items available',price_difference:'Available savings',activity_period_total:'Activities in {period}',chart_insight_dynamic:'Most active on {day}: {count} activities.',category_note_dynamic:'Most listed category: {category} ({count}).',no_chart_activity:'No marketplace activity during this period.',items_handed_over:'Items handed over',verified_student:'Verified student',verification_notification_title:'Student status verified',verification_notification_body:'Your UiTM email is verified and your student badge is now visible.',order_complete_notification_title:'Order completed',order_complete_notification_body:'The order for {item} was marked complete.',mark_order_complete:'Mark complete',order_completed:'Order marked complete.'});
  Object.assign(messages.ms,{saves_activity:'Simpanan baharu',chart_sources:'Sumber data: rekod iklan, pesanan dan simpanan dalam browser.'});
  Object.assign(messages.en,{saves_activity:'New saves',chart_sources:'Sources: listing, order and saved activity records in this browser.'});
  Object.assign(messages.ms,{dashboard:'Dashboard',verified_sellers_only:'Pelajar disahkan',verified_account_title:'Akaun pelajar disahkan',verified_account_body:'Identiti pelajar UiTM untuk akaun ini telah disahkan.',verified_account_pending:'Akaun ini belum disahkan sebagai pelajar.',get_verified:'Dapatkan pengesahan',notification_detail:'Butiran notifikasi',marked:'Dibaca'});
  Object.assign(messages.en,{dashboard:'Dashboard',verified_sellers_only:'Verified students',verified_account_title:'Verified student account',verified_account_body:'This account has a verified UiTM student identity.',verified_account_pending:'This account is not yet verified as a student.',get_verified:'Get verified',notification_detail:'Notification details',marked:'Read'});
  Object.assign(messages.ms,{my_account_data:'Peribadi',market_data:'Global',personal_money_flow:'ALIRAN DUIT AWAK',personal_finance_title:'Ringkasan jual beli peribadi',all_time:'Semua',current_balance:'Baki bersih',spending:'Perbelanjaan',purchase_savings:'Jimat berbanding harga asal',listing_value:'Nilai listing aktif',average_sale:'Purata jualan',edit_listing:'Edit listing',update_listing:'Kemas kini listing',listing_updated:'Listing berjaya dikemas kini',product_details:'Butiran barang',good_things_happen:'PUSAT NOTIFIKASI',notification_note_title:'Pesanan, listing dan pengesahan.',notification_note_body:'Semua perkembangan penting juaija disusun di satu tempat.',delivery_method:'Kaedah serahan',meetup_only:'COD / jumpa sahaja',post_available:'Pos juga tersedia',change_avatar:'Tukar avatar',avatar_hint:'JPG, PNG atau WebP',username_info_title:'Panduan nama pengguna',fresh_finds:'Cadangan untuk awak'});
  Object.assign(messages.en,{my_account_data:'Personal',market_data:'Global',personal_money_flow:'YOUR MONEY FLOW',personal_finance_title:'Personal buying and selling summary',all_time:'All',current_balance:'Net balance',spending:'Spending',purchase_savings:'Saved versus original price',listing_value:'Active listing value',average_sale:'Average sale',edit_listing:'Edit listing',update_listing:'Update listing',listing_updated:'Listing updated successfully',product_details:'Item details',good_things_happen:'NOTIFICATION CENTRE',notification_note_title:'Orders, listings and verification.',notification_note_body:'Every important juaija update, organised in one place.',delivery_method:'Delivery method',meetup_only:'COD / meet-up only',post_available:'Postage available',change_avatar:'Change avatar',avatar_hint:'JPG, PNG or WebP',username_info_title:'Username guide',fresh_finds:'Recommended for you'});

  Object.assign(messages.ms,JuaijaOrders.messages.ms,StudentVerification.messages.ms,{order_oldest:'Terlama'});
  Object.assign(messages.en,JuaijaOrders.messages.en,StudentVerification.messages.en,{order_oldest:'Oldest'});
  messages.ms.auth_username_rules = messages.ms.username_rules_hint;
  messages.en.auth_username_rules = messages.en.username_rules_hint;

  const defaultNotifications = () => [
    { id:'n1', titleKey:'notif_demo_title', bodyKey:'notif_demo_body', icon:'logo', tone:'mint', time:Date.now(), read:false }
  ];
  const productPhotos={Books:'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=85',Electronics:'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=85',Fashion:'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=85',Home:'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=85',Sports:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=85',Other:'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=800&q=85'};
  const productGalleryPhotos={
    Books:['https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1000&q=85','https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1000&q=85'],
    Electronics:['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85','https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85'],
    Fashion:['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85','https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85'],
    Home:['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85','https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1000&q=85'],
    Sports:['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=85','https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=85'],
    Other:['https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1000&q=85','https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1000&q=85']
  };
  const freshState = () => ({ users:[{...DEFAULT_USER}], currentUserId:DEFAULT_USER.id, listings:sampleListings.map(x=>({...x,image:x.image||productPhotos[x.category]})), favorites:[], orders:[], notifications:defaultNotifications(), activityEvents:[], settings:{lang:'ms',theme:'light'}, profileEdits:{} });
  let state = loadState();
  let currentPage = 'home';
  let ordersController, verificationController;
  let marketState = { category:'all', view:'grid', page:1, perPage:20, search:'', sort:'newest', verifiedOnly:false };
  let notifFilter = 'all';
  let chartPeriod = 'week';
  let dashboardScope = 'personal';
  let financePeriod = 'all';
  let editingListingId = null;
  let uploadedImage = '';
  let uploadedImages = [];

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const t = key => messages[state.settings.lang]?.[key] ?? key;
  const format = (key, values={}) => Object.entries(values).reduce((copy,[name,value])=>copy.replaceAll(`{${name}}`,String(value)),t(key));
  function setRuntimeText(element, key){
    if(!element)return;
    if(key){element.dataset.i18nRuntime=key;element.textContent=t(key);}
    else{delete element.dataset.i18nRuntime;element.textContent='';}
  }
  const listingCopy = (item, field) => field==='location'
    ? (sampleLocationTranslations[item.id]?.[state.settings.lang] ?? item.location ?? '')
    : (sampleListingTranslations[item.id]?.[state.settings.lang]?.[field] ?? item[field] ?? '');
  const notificationCopy = (notification, key) => {
    const params={...(notification.params||{})};
    if(params.listingId){const item=state.listings.find(listing=>listing.id===params.listingId);if(item)params.item=listingCopy(item,'title');}
    return format(key,params);
  };
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const money = value => `RM ${Number(value || 0).toLocaleString(state.settings.lang === 'ms' ? 'ms-MY' : 'en-MY', {minimumFractionDigits:0, maximumFractionDigits:2})}`;
  const verifiedBadge = user => StudentVerification.isActive(user)?`<button type="button" class="verified-badge-button" data-action="verified-info" data-user-id="${escapeHtml(user.id)}" aria-label="${escapeHtml(t('verified_student'))}" title="${escapeHtml(t('verified_student'))}"><i class="bi bi-patch-check-fill student-verified" aria-hidden="true"></i></button>`:'';
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
  const avatarUrl = user => user?.avatar || 'assets/avatar-cartoon.svg';
  const sellerHandle = name => String(name||'student').replace(/^@/,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  const ICON_ALIASES = {'\u2733':'stars','\u2726':'stars','\u2727':'stars','\u2197':'arrow-up-right','\u2661':'heart','\u2665':'heart-fill'};
  const ICON_NAMES = new Set(['arrow-up-right','bag','battery-half','bell','bell-slash','book-half','box-seam','calculator','calendar3','chevron-left','chevron-right','cpu','dumbbell','edit','eye','eye-slash','fan','geo-alt','gear','grid-3x3-gap','headphones','heart','heart-fill','house','house-door','journal-text','keyboard','lightbulb','list-ul','pencil','person','plus-lg','search','stars','trophy','x-lg']);
  const CATEGORY_ICONS = {Books:'book-half',Electronics:'cpu',Fashion:'bag',Home:'house-door',Sports:'trophy',Other:'box-seam'};
  const iconMarkup = (name, extraClass='') => { const key=ICON_ALIASES[name] || (ICON_NAMES.has(name)?name:'stars'); return `<i class="bi bi-${key}${extraClass?' '+extraClass:''}" aria-hidden="true"></i>`; };
  const productIcon = item => iconMarkup(ICON_NAMES.has(item.icon)?item.icon:(CATEGORY_ICONS[item.category]||'box-seam'));
  function loadState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshState();
      const saved = JSON.parse(raw);
      const base = freshState();
      const merged = {...base,...saved, settings:{...base.settings,...saved.settings}};
      if (!Array.isArray(merged.users) || !merged.users.some(u=>u.id===DEFAULT_USER.id)) merged.users = [{...DEFAULT_USER}, ...(merged.users||[])];
      if (!Array.isArray(merged.listings)) merged.listings = base.listings;
      merged.listings.forEach(item=>{if(!item.image)item.image=productPhotos[item.category];});
      if (!Array.isArray(merged.favorites)) merged.favorites = [];
      if (!Array.isArray(merged.orders)) merged.orders = [];
      if (!Array.isArray(merged.activityEvents)) merged.activityEvents = [];
      if (!Array.isArray(merged.notifications)) merged.notifications = defaultNotifications();
      merged.notifications = merged.notifications.filter(notification=>!(
        ['n2','n3'].includes(notification.id) && ['notif_trend_title','notif_saved_title'].includes(notification.titleKey)
      ));
      merged.notifications.forEach(notification=>{
        if(notification.titleKey||!notification.titleText)return;
        const interestTitle=notification.titleText.match(/^(?:Minat untuk |Interested in )([\s\S]+)$/);
        const interestSeller=(notification.bodyText||'').match(/(?:Penjual |Contact )(.+?)(?: boleh dihubungi untuk atur serahan\.| to arrange a handoff\.)$/);
        if(interestTitle&&interestSeller){
          notification.titleKey='interest_title'; notification.bodyKey='interest_body';
          const related=merged.listings.find(item=>item.title===interestTitle[1]);
          notification.params=related?{listingId:related.id,seller:interestSeller[1]}:{item:interestTitle[1],seller:interestSeller[1]}; delete notification.titleText; delete notification.bodyText; return;
        }
        const liveTitle=['Listing awak dah live!','Your listing is live!'].includes(notification.titleText);
        const liveBody=(notification.bodyText||'').match(/^([\s\S]+?)(?: kini dipaparkan di marketplace\.| is now on the marketplace\.)$/);
        if(liveTitle&&liveBody){
          notification.titleKey='listing_live_title'; notification.bodyKey='listing_live_body';
          const related=merged.listings.find(item=>item.title===liveBody[1]);
          notification.params=related?{listingId:related.id}:{item:liveBody[1]}; delete notification.titleText; delete notification.bodyText;
        }
      });
      merged.users.forEach(user=>{
        delete user.name;delete user.initials;delete user.campus;
        if(user.id===DEFAULT_USER.id&&user.bio==='Student yang percaya barang baik patut dapat peluang kedua.'){delete user.bio;user.bioKey='default_demo_bio';}
        if(user.bio==='Baru menyertai komuniti juaija.'||user.bio==='New to the juaija community.'){delete user.bio;user.bioKey='new_member_bio';}
      });
      if (merged.currentUserId !== null && !merged.users.some(u=>u.id===merged.currentUserId)) merged.currentUserId = DEFAULT_USER.id;
      return merged;
    } catch { return freshState(); }
  }
  function persist(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
    catch { toast('storage_error', ''); return false; }
  }
  const currentUser = () => state.users.find(user=>user.id===state.currentUserId) || DEFAULT_USER;
  const isLoggedIn = () => !!state.currentUserId;
  function currentUserName(){ return "@" + currentUser().username; }
  function nameInitials(user=currentUser()) { return (user.username||"j").slice(0,1).toLowerCase(); }
  function setAvatar(element,user){
    if(!element)return;
    const image=document.createElement('img');
    element.dataset.fallback=nameInitials(user);
    image.src=avatarUrl(user);
    image.alt='';
    image.addEventListener('error',()=>{image.remove();element.classList.remove('has-photo');},{once:true});
    element.replaceChildren(image);
    element.classList.add('has-photo');
  }
  function applyIcons(){
    const icons={search:'search',bell:'bell',settings:'gear',grid:'grid-3x3-gap',list:'list-ul',user:'person',home:'house',edit:'pencil',calendar:'calendar3',plus:'plus-lg',bag:'bag'};
    $$('.icon[data-icon]').forEach(el=>{el.innerHTML=iconMarkup(icons[el.dataset.icon]);});
  }
  function applyLanguage(){
    document.documentElement.lang = state.settings.lang === 'ms' ? 'ms-MY' : 'en-MY';
    $$('[data-i18n]').forEach(el=>{ const value=t(el.dataset.i18n); if (value.includes('<br>') || value.includes('<em>')) el.innerHTML=value; else el.textContent=value; });
    $$('[data-i18n-placeholder]').forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));
    $$('[data-i18n-aria-label]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.i18nAriaLabel)));
    $$('[data-i18n-title]').forEach(el=>el.setAttribute('title',t(el.dataset.i18nTitle)));
    $$('[data-i18n-content]').forEach(el=>el.setAttribute('content',t(el.dataset.i18nContent)));
    $$('[data-i18n-runtime]').forEach(el=>el.textContent=t(el.dataset.i18nRuntime));
    $$('#listingForm select[name="category"] option').forEach(el=>{ const item=categoryName[el.value]; if(item)el.textContent=item[state.settings.lang]; });
    $$('#listingForm select[name="condition"] option').forEach(el=>{ const item=conditionName[el.value]; if(item)el.textContent=item[state.settings.lang]; });
    const listingPlaceholders={title:'title_placeholder',originalPrice:'original_placeholder',description:'description_placeholder',location:'location_placeholder'};
    Object.entries(listingPlaceholders).forEach(([name,key])=>{const field=$(`#listingForm [name="${name}"]`);if(field)field.placeholder=t(key);});
    const authPlaceholders={identity:'login_identity_placeholder',password:'login_password_placeholder'};
    Object.entries(authPlaceholders).forEach(([name,key])=>{const field=$(`#loginForm [name="${name}"]`);if(field)field.placeholder=t(key);});
    const signupPlaceholders={username:'username_placeholder',password:'password_placeholder'};
    Object.entries(signupPlaceholders).forEach(([name,key])=>{const field=$(`#signupForm [name="${name}"]`);if(field)field.placeholder=t(key);});
    $('#homeDate').textContent=new Intl.DateTimeFormat(state.settings.lang==='ms'?'ms-MY':'en-MY',{weekday:'long',day:'numeric',month:'long'}).format(new Date()).toUpperCase();
    $$('[data-lang-choice]').forEach(el=>el.classList.toggle('active',el.dataset.langChoice===state.settings.lang));
    $$('[data-auth-lang]').forEach(el=>el.classList.toggle('active',el.dataset.authLang===state.settings.lang));
    document.title = t('page_title');
    renderAll();
  }
  function applyTheme(){
    document.body.dataset.theme = state.settings.theme || 'light';
    $$('[data-theme-choice]').forEach(button=>{const active=button.dataset.themeChoice===state.settings.theme;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    const meta=$('meta[name="theme-color"]'); if(meta) meta.content=state.settings.theme==='dark'?'#8295d8':'#8295d8';
  }
  function setPage(page, updateHash=true){
    if (!$('#page-'+page)) page='home';
    if(page!=='sell'&&editingListingId){
      editingListingId=null; const form=$('#listingForm'); form?.reset(); uploadedImage=''; uploadedImages=[];
      const submit=form?.querySelector('[type="submit"] [data-i18n]'); if(submit){submit.dataset.i18n='publish_listing';submit.textContent=t('publish_listing');}
    }
    currentPage=page;
    $$('.page').forEach(el=>el.classList.toggle('active',el.id===`page-${page}`));
    $$('[data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page===page && (el.classList.contains('nav-link') || el.classList.contains('settings-trigger') || el.closest('.mobile-nav'))));
    if(updateHash) history.replaceState(null,'',`#${page}`);
    if(page==='notifications') renderNotifications();
    if(page==='profile') renderProfile();
    if(page==='explore') renderMarketplace();
    if(page==='orders') renderOrders();
    if(page==='verify') renderVerification();
    if(page==='home')updateIdentity();
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function showApp(){
    $('#authScreen').hidden=true; $('#app').hidden=false;
    updateIdentity(); applyTheme(); applyLanguage();
    const page=location.hash.replace('#',''); setPage(['home','explore','sell','profile','notifications','settings','orders','verify'].includes(page)?page:'home',false);
  }
  function showAuth(){
    $('#app').hidden=true; $('#authScreen').hidden=false;
    updateIdentity(); applyTheme(); applyLanguage();
    $('#loginForm [name="identity"]').value='@alyarahman'; $('#loginForm [name="password"]').value='juaija123';
    $('#demoUsername').textContent='@alyarahman'; setRuntimeText($('#authError'),'');
    const signup=sessionStorage.getItem('juaija.authView')==='signup';
    $('#signupForm').hidden=!signup;$('#loginForm').hidden=signup;$('.demo-card').hidden=signup;$('.auth-divider').hidden=signup;
    const title=$('#authFormTitle');title.dataset.i18n=signup?'create_account':'sign_in_title';title.textContent=t(title.dataset.i18n);
    $('.signup-prompt').innerHTML=signup?`<span>${t('account_exists')}</span> <button id="showSignup">${t('sign_in')}</button>`:`<span>${t('new_to_juaija')}</span> <button id="showSignup">${t('create_account')}</button>`;
  }
  function updateIdentity(){
    const user=currentUser();
    const badge=verifiedBadge(user);
    $("#headerName").innerHTML=`@${escapeHtml(user.username)}${badge}`;
    setAvatar($("#headerAvatar"),user);
    $("#greetingName").textContent="@"+user.username;
    const homeBadge=$("#homeVerifiedBadge"); if(homeBadge){homeBadge.hidden=!StudentVerification.isActive(user);homeBadge.setAttribute('aria-label',t('verified_student'));homeBadge.title=t('verified_student');}
    setAvatar($("#profileAvatar"),user); setAvatar($("#settingsAvatar"),user);
    $("#profileTitle").innerHTML=`@${escapeHtml(user.username)}${badge}`;
    $("#profileBio").textContent=user.bioKey?t(user.bioKey):(user.bio||""); $("#settingsUsername").innerHTML=`@${escapeHtml(user.username)}${badge}`; $("#settingsEmail").textContent=user.email;
    $('#profileSoldCount').textContent=state.orders.filter(order=>order.sellerId===user.id&&order.status==='done').length; $('#profileRating').textContent='—';
    $('#myListingTotal').textContent=state.listings.filter(item=>item.userId===user.id).length; $('#myOrderTotal').textContent=state.orders.filter(order=>order.buyerId===user.id||order.sellerId===user.id).length; $('#mySavedTotal').textContent=state.favorites.length;
    renderVerification();
  }
  function toast(messageKey, title='juaija'){
    const container=$('#toastContainer'); if(!container)return;
    const toastEl=document.createElement('div'); toastEl.className='toast show'; toastEl.setAttribute('role','status');
    toastEl.innerHTML=`<div class="toast-header"><span class="demo-icon me-2">${iconMarkup('stars')}</span><strong class="me-auto">${escapeHtml(title)}</strong><small data-i18n-runtime="time_now">${escapeHtml(t('time_now'))}</small><button type="button" class="btn-close ms-2" data-i18n-aria-label="close" data-i18n-title="close" aria-label="${escapeHtml(t('close'))}" title="${escapeHtml(t('close'))}"></button></div><div class="toast-body" data-i18n-runtime="${escapeHtml(messageKey)}">${escapeHtml(t(messageKey))}</div>`;
    toastEl.querySelector('.btn-close').textContent='×'; container.append(toastEl); toastEl.querySelector('.btn-close').addEventListener('click',()=>toastEl.remove());
    setTimeout(()=>toastEl.remove(),4200);
  }
  function addNotification(titleKey, bodyKey, params={}, tone='mint', icon='stars'){
    state.notifications.unshift({id:uid('n'),titleKey,bodyKey,params,tone,icon,time:Date.now(),read:false});
    persist(); updateNotificationDot(); if(currentPage==='notifications') renderNotifications();
  }
  function updateNotificationDot(){
    const unread=state.notifications.filter(n=>!n.read).length; const dot=$('#notificationDot');dot.hidden=!unread;dot.style.display=unread?'block':'none';
    if($('#unreadCount'))$('#unreadCount').textContent=unread;if($('#allNotifCount'))$('#allNotifCount').textContent=state.notifications.length;
  }
  function getCategoryLabel(item){ return (categoryName[item.category]&&categoryName[item.category][state.settings.lang])||item.categoryLabel||t('items'); }
  function conditionLabel(condition){ return (conditionName[condition]&&conditionName[condition][state.settings.lang])||condition; }
  function toneClass(category){return ({Books:'tone-book',Electronics:'tone-electronics',Fashion:'tone-fashion',Home:'tone-home',Sports:'tone-sports',Other:'tone-other'})[category]||'tone-other';}
  // Shared listing card keeps the home, explore, saved, and profile views in sync.
  function renderCard(item){
    const saved=state.favorites.includes(item.id);
    const author=state.users.find(u=>u.id===item.userId);
    const seller=author?('@'+author.username):('@'+sellerHandle(item.seller));
    const verified=StudentVerification.isActive(author);
    const title=listingCopy(item,'title');
    const savings=item.originalPrice>item.price?Math.round((1-item.price/item.originalPrice)*100):0;
    return `<article class="listing-card" data-listing-id="${escapeHtml(item.id)}"><button class="favorite-button ${saved?'active':''}" data-action="favorite" data-id="${escapeHtml(item.id)}" aria-label="${escapeHtml(t(saved?'remove_saved':'save_item'))}" title="${escapeHtml(t(saved?'remove_saved':'save_item'))}">${saved?iconMarkup('heart-fill'):iconMarkup('heart')}</button><div class="listing-visual ${toneClass(item.category)}" data-action="detail" data-id="${escapeHtml(item.id)}" role="button" tabindex="0"><span class="condition-tag">${escapeHtml(conditionLabel(item.condition))}</span>${item.image?`<span class="product-icon" style="display:none">${productIcon(item)}</span><img src="${item.image}" alt="${escapeHtml(title)}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0">`:`<span class="product-icon">${productIcon(item)}</span>`}</div><div class="listing-body" data-action="detail" data-id="${escapeHtml(item.id)}" role="button" tabindex="0"><p class="listing-category">${escapeHtml(getCategoryLabel(item))}</p><h3 class="listing-title" title="${escapeHtml(title)}">${escapeHtml(title)}</h3><div class="listing-price-row">${item.originalPrice>item.price?`<span class="listing-saving">−${savings}%</span><span class="listing-original">${money(item.originalPrice)}</span>`:''}<span class="listing-price">${money(item.price)}</span></div><div class="listing-meta"><span class="seller-mini"><span class="seller-mini-avatar"><img src="${avatarUrl(seller)}" alt=""></span><span class="seller-mini-identity"><span class="seller-mini-name">${escapeHtml(seller)}</span>${verified?verifiedBadge(author):''}</span></span><span class="listing-location">${iconMarkup('geo-alt')}<span class="listing-location-text">${escapeHtml(listingCopy(item,'location')||t('campus'))}</span></span></div></div></article>`;
  }
  function renderListings(){
    $('#homeListings').innerHTML=getFilteredListings().slice(0,4).map(renderCard).join('');
    renderMarketplace(); renderProfile(); renderSellerSummary();
  }
  function getFilteredListings(){
    let items=state.listings.filter(item=>item.status!=='sold'); const q=marketState.search.trim().toLowerCase();
    if(marketState.category!=='all') items=items.filter(item=>item.category===marketState.category);
    if(marketState.verifiedOnly)items=items.filter(item=>StudentVerification.isActive(state.users.find(user=>user.id===item.userId)));
    if(q) items=items.filter(item=>[listingCopy(item,'title'),listingCopy(item,'description'),listingCopy(item,'location'),item.title,item.description,item.seller,item.location,item.categoryLabel,getCategoryLabel(item)].join(' ').toLowerCase().includes(q));
    if(marketState.sort==='price-low') items.sort((a,b)=>a.price-b.price);
    else if(marketState.sort==='price-high') items.sort((a,b)=>b.price-a.price);
    else if(marketState.sort==='popular') items.sort((a,b)=>(b.likes||0)-(a.likes||0));
    else items.sort((a,b)=>b.createdAt-a.createdAt);
    return items;
  }
  function renderCategoryPills(){
    $('#categoryPills').innerHTML=categories.map(cat=>`<button class="category-pill ${marketState.category===cat.id?'active':''}" data-category="${cat.id}">${state.settings.lang==='ms'?cat.ms:cat.en}</button>`).join('');
  }
  function renderMarketplace(){
    if(!$('#marketGrid'))return;
    renderCategoryPills();
    const filtered=getFilteredListings(); const start=(marketState.page-1)*marketState.perPage; const items=filtered.slice(start,start+marketState.perPage);
    $('#marketGrid').classList.toggle('listing-list-mode',marketState.view==='list');
    $('#marketGrid').innerHTML=items.map(renderCard).join('');
    $('#emptyState').hidden=filtered.length!==0; $('#marketGrid').hidden=filtered.length===0;
    $('#resultCount').textContent=`${t('showing')} ${Math.min(marketState.perPage,filtered.length)} ${t('of')} ${filtered.length} ${t('page_items')}`;
    const rangeStart=filtered.length?start+1:0, rangeEnd=Math.min(start+marketState.perPage,filtered.length);
    $('#pageStatus').textContent=`${rangeStart}-${rangeEnd} ${t('of')} ${filtered.length} ${t('page_items')}`;
    $('#prevPage').disabled=marketState.page<=1; $('#nextPage').disabled=start+marketState.perPage>=filtered.length;
    const pageCount=Math.max(1,Math.ceil(filtered.length/marketState.perPage));
    $('.current-page').textContent=`${marketState.page} / ${pageCount}`;
    $('#marketSearch').value=marketState.search; $('#sortSelect').value=marketState.sort; $('#showCount').value=marketState.perPage;
    $('#verifiedOnly').checked=marketState.verifiedOnly;
    $$('.view-button').forEach(btn=>btn.classList.toggle('active',btn.dataset.view===marketState.view));
  }
  function renderProfile(){
    if(!$('#profileListings'))return;
    const own=state.listings.filter(item=>item.userId===currentUser().id).sort((a,b)=>b.createdAt-a.createdAt);
    $('#profileListings').innerHTML=own.length?own.map(renderCard).join(''):`<div class="profile-empty">${escapeHtml(t('profile_listings_empty'))}</div>`;
    $('#profileListingsCount').textContent=own.length; $('#savedCount').textContent=state.favorites.length;
    const saved=state.listings.filter(item=>state.favorites.includes(item.id)).slice(0,3);
    $('#savedItemsList').innerHTML=saved.length?saved.map(item=>`<button type="button" class="saved-item-row" data-action="detail" data-id="${escapeHtml(item.id)}"><span class="saved-item-thumb ${toneClass(item.category)}">${item.image?`<img src="${item.image}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius)">`:productIcon(item)}</span><span class="saved-item-copy"><strong>${escapeHtml(listingCopy(item,'title'))}</strong><small>${escapeHtml(getCategoryLabel(item))}</small></span><span class="saved-item-price">${money(item.price)}</span></button>`).join(''):`<p class="saved-empty">${escapeHtml(t('saved_empty'))}</p>`;
    updateIdentity();
  }
  function renderSellerSummary(){
    const own=state.listings.filter(item=>item.userId===currentUser().id);
    $('#sellerCount').textContent=own.length;
    $('#sellerEarnings').textContent=money(own.reduce((sum,item)=>sum+Number(item.price||0),0));
  }
  function renderNotifications(){
    if(!$('#notificationList'))return;
    const visible=state.notifications.filter(n=>notifFilter==='all'||!n.read);
    if($('#allNotifCount'))$('#allNotifCount').textContent=state.notifications.length;if($('#unreadCount'))$('#unreadCount').textContent=state.notifications.filter(n=>!n.read).length;
    $$('.notif-tab').forEach(button=>button.classList.toggle('active',button.dataset.notifFilter===notifFilter));
    $('#notificationList').innerHTML=visible.length?visible.map(notification=>{
      const title=notification.titleKey?notificationCopy(notification,notification.titleKey):notification.titleText;
      const body=notification.bodyKey?notificationCopy(notification,notification.bodyKey):notification.bodyText;
      const time=new Intl.DateTimeFormat(state.settings.lang==='ms'?'ms-MY':'en-MY',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(notification.time));
      const notificationIcon=notification.titleKey==='verification_notification_title'?'<i class="bi bi-patch-check-fill" aria-hidden="true"></i>':notification.icon==='logo'||notification.titleKey==='notif_demo_title'?'<img src="assets/logo.png" alt="">':iconMarkup(notification.icon||'bell');
      return `<article class="notification-item ${notification.read?'':'unread'}" data-notification-id="${notification.id}" tabindex="0"><span class="notif-icon ${notification.tone}">${notificationIcon}</span><div class="notif-copy"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(body||'')}</p><time>${time}${notification.read?` · ${t('marked')}`:''}</time></div></article>`;
    }).join(''):`<div class="empty-state"><span class="empty-illustration">${iconMarkup('bell-slash')}</span><h3>${escapeHtml(t('caught_up'))}</h3><p>${escapeHtml(t('notifications_empty'))}</p></div>`;
    updateNotificationDot();
  }
  function renderVerification(){ verificationController?.render(); }
  function renderOrders(){ ordersController?.render(); }
  function renderCategoryChart(){
    const counts={};
    state.listings.filter(item=>item.status!=='sold').forEach(item=>counts[item.category]=(counts[item.category]||0)+1);
    const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,4);
    const max=Math.max(...top.map(row=>row[1]),1);
    $('#categoryBars').innerHTML=top.map(([cat,count])=>`<div class="category-row"><span>${escapeHtml(categoryName[cat]?.[state.settings.lang]||cat)}</span><span class="category-track"><span style="width:${Math.max(14,count/max*100)}%"></span></span><strong>${count}</strong></div>`).join('');
    const note=$('#categoryNote'),icon=$('#categoryFootIcon');
    if(note)note.textContent=top.length?format('category_note_dynamic',{category:categoryName[top[0][0]]?.[state.settings.lang]||top[0][0],count:top[0][1]}):t('no_chart_activity');
    if(icon)icon.innerHTML=top.length?iconMarkup(CATEGORY_ICONS[top[0][0]]||'box-seam'):iconMarkup('box-seam');
  }
  function pointsFor(values,scale){
    const xs=values.map((_,i)=>42+i*(658/(values.length-1))); const ys=values.map(v=>200-(v/scale)*165);
    const line=xs.map((x,i)=>`${i===0?'M':'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
    const area=`${line} L ${xs[xs.length-1].toFixed(1)} 200 L ${xs[0].toFixed(1)} 200 Z`;
    return {xs,ys,line,area};
  }
  function renderChart(){
    const days=chartPeriod==='week'?7:30,now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    const sources=[
      {key:'new_listings',className:'listings',records:state.listings,timestamp:item=>item.createdAt},
      {key:'orders',className:'orders',records:state.orders,timestamp:order=>order.createdAt},
      {key:'saves_activity',className:'saves',records:(state.activityEvents||[]).filter(event=>event.type==='saved'),timestamp:event=>event.at}
    ];
    const values=sources.map(()=>Array(7).fill(0));
    const bucketFor=timestamp=>{
      const date=new Date(Number(timestamp));
      if(!Number.isFinite(date.getTime()))return -1;
      const offset=Math.floor((today-date)/86400000);
      if(offset<0||offset>=days)return -1;
      return Math.min(6,Math.floor((days-1-offset)*7/days));
    };
    sources.forEach((source,seriesIndex)=>source.records.forEach(record=>{const index=bucketFor(source.timestamp(record));if(index>=0)values[seriesIndex][index]++;}));
    const maximum=Math.max(1,...values.flat()),axisMax=Math.max(4,Math.ceil(maximum/4)*4);
    const locale=state.settings.lang==='ms'?'ms-MY':'en-MY';
    const labs=values[0].map((_,index)=>{
      const firstElapsed=Math.ceil(index*days/7),lastElapsed=Math.ceil((index+1)*days/7)-1;
      const startDate=new Date(today.getTime()-(days-1-firstElapsed)*86400000);
      const endDate=new Date(today.getTime()-(days-1-lastElapsed)*86400000);
      if(days===7)return new Intl.DateTimeFormat(locale,{weekday:'short'}).format(startDate);
      if(startDate.getMonth()===endDate.getMonth()){
        const month=new Intl.DateTimeFormat(locale,{month:'short'}).format(startDate);
        return `${startDate.getDate()}-${endDate.getDate()} ${month}`;
      }
      const formatDate=date=>new Intl.DateTimeFormat(locale,{day:'numeric',month:'short'}).format(date);
      return `${formatDate(startDate)}-${formatDate(endDate)}`;
    });
    const plotted=values.map(series=>pointsFor(series,axisMax));
    const [listing,orders,saves]=plotted;
    $('#areaListings').setAttribute('d',listing.area); $('#lineListings').setAttribute('d',listing.line);
    $('#areaOrders').setAttribute('d',orders.area); $('#lineOrders').setAttribute('d',orders.line);
    $('#areaSaves').setAttribute('d',saves.area); $('#lineSaves').setAttribute('d',saves.line);
    $('#chartPoints').innerHTML=sources.map((source,seriesIndex)=>values[seriesIndex].map((count,index)=>count?`<circle class="chart-point chart-series-${source.className}" cx="${listing.xs[index]}" cy="${plotted[seriesIndex].ys[index]}" r="4"><title>${escapeHtml(t(source.key))}: ${count}</title></circle>`:'').join('')).join('');
    $('#chartLabels').innerHTML=labs.map((label,i)=>`<text x="${listing.xs[i]}" y="228">${label}</text>`).join('');
    $('#chartYAxis').innerHTML=[axisMax,Math.round(axisMax*2/3),Math.round(axisMax/3),0].map((value,index)=>`<text x="4" y="${39+index*55}">${value}</text>`).join('');
    const seriesTotals=values.map(series=>series.reduce((sum,value)=>sum+value,0));
    const activityTotal=seriesTotals.reduce((sum,value)=>sum+value,0);
    $('#chartListingsTotal').textContent=seriesTotals[0]; $('#chartOrdersTotal').textContent=seriesTotals[1]; $('#chartSavesTotal').textContent=seriesTotals[2];
    $('#chartTotal').textContent=activityTotal;
    $('#chartTotalLabel').textContent=t('activity_period_total').replace('{period}',t(chartPeriod==='week'?'account_week':'account_month'));
    const activityByBucket=values[0].map((_,index)=>values.reduce((sum,series)=>sum+series[index],0)),peakIndex=activityByBucket.indexOf(Math.max(...activityByBucket));
    const heatmap=$('#activityHeatmap');if(heatmap){const rows=['8-11','11-2','2-5','5-8'];heatmap.innerHTML=`<span></span>${labs.map(label=>`<strong>${escapeHtml(label)}</strong>`).join('')}${rows.map((row,rowIndex)=>`<span>${row}</span>${labs.map((_,dayIndex)=>{const base=activityByBucket[dayIndex]||0;const value=Math.max(0,Math.round(base*(.35+((dayIndex+rowIndex*2)%4)*.2)));const level=value?Math.min(4,Math.max(1,Math.ceil(value/Math.max(axisMax,1)*4))):0;return `<i class="heat-${level}" title="${escapeHtml(labs[dayIndex])}, ${row}: ${value} ${escapeHtml(t('activities_recorded'))}"></i>`;}).join('')}`).join('')}<small>Kurang</small><small class="heat-scale"><i class="heat-1"></i><i class="heat-2"></i><i class="heat-3"></i><i class="heat-4"></i></small><small>Aktif</small>`;}
    $('#chartInsight').textContent=activityTotal?format('chart_insight_dynamic',{day:labs[peakIndex],count:activityByBucket[peakIndex]}):t('no_chart_activity');
    $$('[data-period]').forEach(btn=>btn.classList.toggle('active',btn.dataset.period===chartPeriod));
  }
  function renderCommunityMetrics(){
    const available=state.listings.filter(item=>item.status!=='sold');
    const savedValue=available.reduce((sum,item)=>sum+Math.max(0,Number(item.originalPrice||0)-Number(item.price||0)),0);
    const completedOrders=state.orders.filter(order=>order.status==='done');
    const handedOverItems=new Set(completedOrders.map(order=>order.listingId)).size;
    $('#metricListings').textContent=available.length;
    $('#metricSaved').textContent=money(savedValue);
    $('#metricSales').textContent=completedOrders.length;
    $('#metricImpact').innerHTML=`${handedOverItems}<span class="metric-unit"> <span data-i18n="items">${escapeHtml(t('items'))}</span></span>`;
  }
  function renderPersonalDashboard(){
    const user=currentUser(),done=state.orders.filter(order=>order.status==='done');
    const sales=done.filter(order=>order.sellerId===user.id),purchases=done.filter(order=>order.buyerId===user.id);
    const income=sales.reduce((sum,order)=>sum+Number(order.price||0),0),spending=purchases.reduce((sum,order)=>sum+Number(order.price||0),0);
    const savings=purchases.reduce((sum,order)=>{const item=state.listings.find(row=>row.id===order.listingId);return sum+Math.max(0,Number(item?.originalPrice||order.price||0)-Number(order.price||0));},0);
    const activeOwn=state.listings.filter(item=>item.userId===user.id&&!['sold'].includes(item.status)),listingValue=activeOwn.reduce((sum,item)=>sum+Number(item.price||0),0);
    const cutoff=financePeriod==='week'?Date.now()-7*86400000:financePeriod==='month'?Date.now()-30*86400000:0;
    const periodSales=sales.filter(order=>Number(order.completedAt||order.createdAt)>=cutoff),periodPurchases=purchases.filter(order=>Number(order.completedAt||order.createdAt)>=cutoff);
    const periodIncome=periodSales.reduce((sum,order)=>sum+Number(order.price||0),0),periodSpending=periodPurchases.reduce((sum,order)=>sum+Number(order.price||0),0);
    const periodSavings=periodPurchases.reduce((sum,order)=>{const item=state.listings.find(row=>row.id===order.listingId);return sum+Math.max(0,Number(item?.originalPrice||order.price||0)-Number(order.price||0));},0);
    const balance=periodIncome-periodSpending,max=Math.max(periodIncome,periodSpending,periodSavings,1),incomeShare=Math.round(periodIncome/max*100),spendingShare=Math.round(periodSpending/max*100),savingsShare=Math.round(periodSavings/max*100);
    $('#financeBalance').textContent=money(balance); $('#financeIncome').textContent=money(periodIncome); $('#financeSpending').textContent=money(periodSpending); $('#financeSavings').textContent=money(periodSavings);
    $('#financeIncomeBar').style.width=`${incomeShare}%`; $('#financeSpendingBar').style.width=`${spendingShare}%`; $('#financeSavingsBar').style.width=`${savingsShare}%`;
    $('#financeRing').style.setProperty('--income-share',`${periodIncome||periodSpending?Math.round(periodIncome/Math.max(periodIncome+periodSpending,1)*100):0}%`);
    $('#activeListingValue').textContent=money(listingValue); $('#personalSoldCount').textContent=sales.length; $('#averageSaleValue').textContent=money(sales.length?income/sales.length:0);
    $('#personalDashboardPanel').hidden=dashboardScope!=='personal'; $('#marketDashboardPanel').hidden=dashboardScope!=='market'; $('#marketMetricGrid').hidden=dashboardScope!=='market';
    $('.personal-summary-grid').hidden=dashboardScope==='market';
    const home=$('#page-home'),metrics=$('#marketMetricGrid'),market=$('#marketDashboardPanel');if(dashboardScope==='market'&&metrics&&market)home.insertBefore(metrics,market);
    $$('[data-dashboard-scope]').forEach(button=>{const active=button.dataset.dashboardScope===dashboardScope;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    $$('[data-finance-period]').forEach(button=>button.classList.toggle('active',button.dataset.financePeriod===financePeriod));
  }
  function renderAll(){
    if(StudentVerification.synchronize(state))persist();
    updateIdentity(); renderListings(); renderCategoryChart(); renderChart(); renderCommunityMetrics(); renderPersonalDashboard(); renderNotifications(); updateNotificationDot();
    renderOrders(); renderVerification();
    if($('#marketSearch')) renderMarketplace();
  }

  function recordActivity(type){
    state.activityEvents=state.activityEvents||[];
    state.activityEvents.push({userId:currentUser().id,type,at:Date.now()});
    if(state.activityEvents.length>500)state.activityEvents=state.activityEvents.slice(-500);
  }

  function clearFieldErrors(form){
    if(!form)return;
    $$('[data-error]',form).forEach(el=>setRuntimeText(el,''));
    $$('.is-invalid',form).forEach(el=>el.classList.remove('is-invalid'));
  }
  function setFieldError(form, name, key){
    const target=form.querySelector(`[data-error="${name}"]`); if(target) setRuntimeText(target,key);
    const input=form.elements[name]; if(input) input.classList.add('is-invalid');
  }
  function login(identity,password){
    const normalized=identity.trim().replace(/^@/,'').toLowerCase();
    const user=state.users.find(candidate=>candidate.username.toLowerCase()===normalized||candidate.email.toLowerCase()===identity.trim().toLowerCase());
    if(!user || user.password!==password){ setRuntimeText($('#authError'),'auth_bad_credentials'); return false; }
    state.currentUserId=user.id; persist(); showApp(); toast('auth_login_ok'); return true;
  }
  function register(form){
    clearFieldErrors(form); setRuntimeText($('#authError'),'');
    const username=form.elements.username.value.trim().replace(/^@/,'').toLowerCase(); const email=form.elements.email.value.trim(); const password=form.elements.password.value;
    let valid=true;
    if(!/^(?!.*\.\.)[a-z0-9_][a-z0-9._]{1,18}[a-z0-9_]$/.test(username.toLowerCase())){setFieldError(form,'username','auth_username_rules');valid=false;}
    if(state.users.some(u=>u.username.toLowerCase()===username.toLowerCase())){setFieldError(form,'username','auth_unique_username');valid=false;}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setFieldError(form,'email','auth_email_invalid');valid=false;}
    if(state.users.some(u=>u.email.toLowerCase()===email.toLowerCase())){setFieldError(form,'email','auth_unique_email');valid=false;}
    if(password.length<8){setFieldError(form,'password','auth_password_short');valid=false;}
    if(!valid)return;
    
    const user={id:uid('user'),username,email,password,bioKey:'new_member_bio'};
    state.users.push(user); state.currentUserId=user.id; persist(); showApp(); toast('account_created');
  }
  function toggleFavorite(id){
    const idx=state.favorites.indexOf(id);
    if(idx===-1){state.favorites.push(id);recordActivity('saved');toast('saved_toast');}
    else{state.favorites.splice(idx,1);toast('unsaved_toast');}
    persist(); renderAll();
  }
  function closeModal(){ $('#modalRoot').innerHTML=''; document.body.classList.remove('modal-open'); }
  function openModal(content){
    closeModal(); const wrap=document.createElement('div'); wrap.className='modal-backdrop-custom'; wrap.innerHTML=content; $('#modalRoot').append(wrap);
    document.body.classList.add('modal-open');
    wrap.addEventListener('click',event=>{if(event.target===wrap)closeModal();});
    wrap.querySelectorAll('[data-close-modal]').forEach(close=>{
      if(close.matches('.dialog-close'))close.textContent='×';
      close.type='button';
      close.addEventListener('click',closeModal);
    });
    return wrap;
  }
  function setupListingGallery(root, gallery, title) {
  const image = root.querySelector('#detailGalleryImage');
  const counter = root.querySelector('#galleryCounter');
  const previous = root.querySelector('[data-gallery-step="-1"]');
  const next = root.querySelector('[data-gallery-step="1"]');
  let activePhoto = 0;
  function showPhoto(index) {
    activePhoto = Math.max(0, Math.min(gallery.length - 1, index));
    if (image) {
      image.src = gallery[activePhoto];
      image.alt = `${title}, ${format('gallery_image', {current: activePhoto + 1, total: gallery.length})}`;
    }
    if (counter) counter.textContent = `${activePhoto + 1} / ${gallery.length}`;
    if (previous) previous.hidden = activePhoto === 0;
    if (next) next.hidden = activePhoto === gallery.length - 1;
  }
  root.querySelectorAll('[data-gallery-step]').forEach(button => {
    button.addEventListener('click', () => showPhoto(activePhoto + Number(button.dataset.galleryStep)));
  });
  showPhoto(0);
}
  function openListingDetail(id) {
  const item=state.listings.find(row=>row.id===id); if(!item)return;
  const author=state.users.find(u=>u.id===item.userId);
  const seller=author?('@'+author.username):('@'+sellerHandle(item.seller));
  const saved=state.favorites.includes(id);
  const itemTitle=listingCopy(item,'title'), itemDescription=listingCopy(item,'description'), itemLocation=listingCopy(item,'location')||t('campus');
  const demoPhotos=String(item.id).startsWith('l')?(productGalleryPhotos[item.category]||[]):[];
  const gallery=[...new Set([...(Array.isArray(item.images)&&item.images.length?item.images:[item.image]),...demoPhotos].filter(Boolean))].slice(0,4);
  if(!gallery.length)gallery.push('');
  const avatarInitial=(seller.replace(/^@/,'')[0]||'j').toLowerCase(),isOwnListing=item.userId===currentUser().id;
  const existingOrder=state.orders.some(order=>order.listingId===id&&order.buyerId===currentUser().id&&['pending','accepted'].includes(order.status));
  const unavailable=['sold','reserved'].includes(item.status);
  const orderAction=isOwnListing?`<div class="dialog-actions"><button type="button" class="button button-primary" data-action="edit-listing" data-id="${escapeHtml(id)}">${iconMarkup('edit')} ${escapeHtml(t('edit_listing'))}</button></div>`:existingOrder?`<div class="dialog-actions"><button type="button" class="button button-primary" data-action="view-orders">${escapeHtml(t('order_view'))}</button></div>`:`<div class="dialog-actions"><button type="button" class="button button-primary" data-action="contact-seller" data-id="${escapeHtml(id)}" ${unavailable?'disabled':''}>${escapeHtml(t(unavailable?'order_unavailable':'order_place'))}</button></div>`;

  const wrap=openModal(`
    <article class="dialog-card product-dialog" role="dialog" aria-modal="true" aria-label="${escapeHtml(itemTitle)}">
      <div class="detail-gallery ${gallery.length>1?'has-gallery':''}">
        <div class="detail-gallery-stage ${toneClass(item.category)}">
          ${gallery[0]?`<img id="detailGalleryImage" src="${escapeHtml(gallery[0])}" alt="${escapeHtml(itemTitle)}">`:`<span class="product-icon">${productIcon(item)}</span>`}
        </div>
        <button type="button" class="detail-favorite ${saved?'active':''}" data-action="detail-favorite" data-id="${escapeHtml(id)}" aria-label="${escapeHtml(t(saved?'remove_saved':'save_item'))}" title="${escapeHtml(t(saved?'remove_saved':'save_item'))}">${saved?iconMarkup('heart-fill'):iconMarkup('heart')}</button>
        <button type="button" class="dialog-close" data-close-modal aria-label="${escapeHtml(t('close_dialog'))}" title="${escapeHtml(t('close_dialog'))}">${iconMarkup('x-lg')}</button>
        ${gallery.length>1?`
          <button type="button" class="gallery-arrow gallery-prev" data-gallery-step="-1" aria-label="${escapeHtml(t('gallery_previous'))}" title="${escapeHtml(t('gallery_previous'))}" hidden>${iconMarkup('chevron-left')}</button>
          <button type="button" class="gallery-arrow gallery-next" data-gallery-step="1" aria-label="${escapeHtml(t('gallery_next'))}" title="${escapeHtml(t('gallery_next'))}">${iconMarkup('chevron-right')}</button>
          <span class="gallery-counter" id="galleryCounter" role="status" aria-live="polite" aria-atomic="true">1 / ${gallery.length}</span>
        `:''}
      </div>
      <div class="detail-content">
        <h2 class="detail-title">${escapeHtml(itemTitle)}</h2>
        <p class="detail-description">${escapeHtml(itemDescription)}</p>
        <div class="detail-info-row">
          <button type="button" class="detail-meta-link" data-action="browse-category" data-category="${escapeHtml(item.category)}"><span>${escapeHtml(t('category').replace(/\s*\*$/,''))}:</span> ${escapeHtml(getCategoryLabel(item))}</button>
          <span class="detail-info-pill detail-condition-pill">${escapeHtml(conditionLabel(item.condition))}</span>
          <span class="detail-info-pill">${iconMarkup('heart')} ${item.likes||0} ${escapeHtml(t('likes_label'))}</span>
          <span class="detail-info-pill detail-location">${iconMarkup('geo-alt')} ${escapeHtml(itemLocation)}</span>
        </div>
        <div class="detail-seller">
          <span class="avatar detail-avatar has-photo" data-fallback="${escapeHtml(avatarInitial)}"><img src="${avatarUrl(seller)}" alt=""></span>
          <span class="detail-seller-copy"><strong>${escapeHtml(seller)}${verifiedBadge(author)}</strong><small>${escapeHtml(t('seller_label'))} · ${escapeHtml(itemLocation)}</small></span>
        </div>
        <div class="detail-price-row">${item.originalPrice>item.price?`<span class="listing-saving">${Math.round((1-item.price/item.originalPrice)*100)}% ${t('percent_less')}</span><del class="listing-original">${money(item.originalPrice)}</del>`:''}<strong>${money(item.price)}</strong></div>
        ${orderAction}
      </div>
    </article>`);
  setupListingGallery(wrap.querySelector('.detail-gallery'), gallery, itemTitle);
  const detailAvatar=wrap.querySelector('.detail-avatar img');
  if(detailAvatar)detailAvatar.addEventListener('error',()=>{detailAvatar.parentElement.classList.remove('has-photo');detailAvatar.remove();});
  wrap.querySelector('[data-action="detail-favorite"]').addEventListener('click',event=>{event.stopPropagation();toggleFavorite(id);const button=event.currentTarget;const active=state.favorites.includes(id);button.classList.toggle('active',active);button.innerHTML=iconMarkup(active?'heart-fill':'heart');});
  wrap.querySelector('[data-action="browse-category"]')?.addEventListener('click',event=>{marketState.category=event.currentTarget.dataset.category;marketState.page=1;closeModal();setPage('explore');renderMarketplace();});
  wrap.querySelector('[data-action="view-orders"]')?.addEventListener('click',()=>{closeModal();setPage('orders');});
  wrap.querySelector('[data-action="edit-listing"]')?.addEventListener('click',()=>openListingEditor(item));
  const contactButton=wrap.querySelector('[data-action="contact-seller"]');
  contactButton?.addEventListener('click',()=>{
    if(ordersController.create(id)){closeModal();setPage('orders');}
  });
}

  function openListingEditor(item){
    closeModal(); editingListingId=item.id; setPage('sell');
    const form=$('#listingForm');
    form.elements.title.value=listingCopy(item,'title'); form.elements.category.value=item.category; form.elements.condition.value=item.condition;
    form.elements.price.value=item.price; form.elements.originalPrice.value=item.originalPrice||''; form.elements.description.value=listingCopy(item,'description'); form.elements.location.value=listingCopy(item,'location');
    if(form.elements.delivery)form.elements.delivery.value=item.delivery||'meetup';
    uploadedImages=Array.isArray(item.images)&&item.images.length?[...item.images]:(item.image?[item.image]:[]); uploadedImage=uploadedImages[0]||'';
    $('#uploadPreview').innerHTML=uploadedImages.map(src=>`<img src="${escapeHtml(src)}" alt="">`).join(''); $('#descriptionCount').textContent=`${form.elements.description.value.length} / 500`;
    const submit=form.querySelector('[type="submit"] [data-i18n]'); if(submit){submit.dataset.i18n='update_listing';submit.textContent=t('update_listing');}
    form.elements.title.focus();
  }

  function openAccountEditor(){
    const user=currentUser();
    const wrap=openModal(`<form class="dialog-card" id="editAccountForm" novalidate role="dialog" aria-modal="true" aria-labelledby="editAccountTitle"><button type="button" class="dialog-close" data-close-modal aria-label="${escapeHtml(t('close_dialog'))}" title="${escapeHtml(t('close_dialog'))}">${iconMarkup('x-lg')}</button><p class="eyebrow">${escapeHtml(t('account'))}</p><h2 id="editAccountTitle">${escapeHtml(t('edit_profile'))}</h2><div class="form-grid"><label class="form-field full-field"><span>${escapeHtml(t('username_label'))}</span><input name="username" value="${escapeHtml(user.username||'')}" maxlength="20" autocomplete="username" required><small class="field-error" data-error="username"></small></label><label class="form-field full-field"><span>${escapeHtml(t('email'))}</span><input name="email" type="email" value="${escapeHtml(user.email||'')}" autocomplete="email" required><small class="field-error" data-error="email"></small></label></div><div class="dialog-actions"><button type="button" class="button button-outline" data-close-modal>${escapeHtml(t('cancel'))}</button><button class="button button-primary" type="submit">${escapeHtml(t('save_changes'))}</button></div></form>`);
    wrap.querySelector('#editAccountForm').addEventListener('submit',event=>{
      event.preventDefault(); const form=event.currentTarget; clearFieldErrors(form);
      const username=form.elements.username.value.trim().replace(/^@/,'').toLowerCase();
      const email=form.elements.email.value.trim().toLowerCase(); let valid=true;
      if(!/^(?!.*\.\.)[a-z0-9_][a-z0-9._]{1,18}[a-z0-9_]$/.test(username)){setFieldError(form,'username','auth_username_rules');valid=false;}
      if(state.users.some(candidate=>candidate.id!==user.id&&candidate.username.toLowerCase()===username)){setFieldError(form,'username','auth_unique_username');valid=false;}
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setFieldError(form,'email','auth_email_invalid');valid=false;}
      if(state.users.some(candidate=>candidate.id!==user.id&&candidate.email.toLowerCase()===email)){setFieldError(form,'email','auth_unique_email');valid=false;}
      if(!valid)return;
      const previous={username:user.username,email:user.email}; user.username=username; user.email=email;
      if(!persist()){Object.assign(user,previous);return;}
      closeModal(); renderAll(); toast('profile_saved');
    });
  }
  function openPrivacyModal(){
    openModal(`<article class="dialog-card privacy-dialog" role="dialog" aria-modal="true" aria-labelledby="privacyModalTitle"><button type="button" class="dialog-close" data-close-modal aria-label="${escapeHtml(t('close_dialog'))}" title="${escapeHtml(t('close_dialog'))}">${iconMarkup('x-lg')}</button><p class="eyebrow">${escapeHtml(t('settings'))}</p><h2 id="privacyModalTitle">${escapeHtml(t('privacy'))}</h2><p class="privacy-modal-intro">${escapeHtml(t('privacy_desc'))}</p><p class="privacy-modal-copy">${escapeHtml(t('privacy_terms_note'))}</p><div class="dialog-actions"><button type="button" class="button button-outline" data-close-modal>${escapeHtml(t('cancel'))}</button></div></article>`);
  }
  function openVerifiedInfo(userId){
    const user=state.users.find(candidate=>candidate.id===userId)||currentUser();
    const verified=StudentVerification.isActive(user);
    openModal(`<article class="dialog-card verified-info-dialog" role="dialog" aria-modal="true" aria-labelledby="verifiedInfoTitle"><button type="button" class="dialog-close" data-close-modal aria-label="${escapeHtml(t('close_dialog'))}">${iconMarkup('x-lg')}</button><i class="bi bi-patch-check-fill verified-info-icon" aria-hidden="true"></i><h2 id="verifiedInfoTitle">${escapeHtml(t(verified?'verified_account_title':'verified_account_pending'))}</h2><p>${escapeHtml(t(verified?'verified_account_body':'verified_account_pending'))}</p>${verified?'':`<button type="button" class="button button-primary" data-close-modal data-page="verify">${escapeHtml(t('get_verified'))}</button>`}</article>`);
  }
  function openNotificationDetail(notification){
    const title=notification.titleKey?notificationCopy(notification,notification.titleKey):notification.titleText;
    const body=notification.bodyKey?notificationCopy(notification,notification.bodyKey):notification.bodyText;
    const time=new Intl.DateTimeFormat(state.settings.lang==='ms'?'ms-MY':'en-MY',{dateStyle:'medium',timeStyle:'short'}).format(new Date(notification.time));
    const verified=notification.titleKey==='verification_notification_title';
    openModal(`<article class="dialog-card notification-detail-dialog ${verified?'verification-notification-dialog':''}" role="dialog" aria-modal="true" aria-labelledby="notificationDetailTitle"><button type="button" class="dialog-close" data-close-modal aria-label="${escapeHtml(t('close_dialog'))}">×</button><span class="notification-modal-icon">${verified?'<i class="bi bi-patch-check-fill"></i>':iconMarkup(notification.icon||'bell')}</span><div class="notification-modal-copy"><p class="eyebrow">${escapeHtml(t('notification_detail'))}</p><h2 id="notificationDetailTitle">${escapeHtml(title)}</h2><p>${escapeHtml(body||'')}</p><time>${escapeHtml(time)}</time></div></article>`);
  }
  function openProfileEditor(){
    const user=currentUser();
    const wrap=openModal(`<form class="dialog-card" id="editProfileForm" novalidate><button type="button" class="dialog-close" data-close-modal aria-label="${escapeHtml(t('close_dialog'))}" title="${escapeHtml(t('close_dialog'))}">×</button><p class="eyebrow">${t('your_profile')}</p><h2>${t('edit_your_profile')}</h2><div class="form-grid"><label class="form-field full-field"><span>${t('short_bio')}</span><textarea name="bio" rows="3" maxlength="180">${escapeHtml(user.bioKey?t(user.bioKey):user.bio||'')}</textarea></label></div><div class="dialog-actions"><button type="button" class="button button-outline" data-close-modal>${t('cancel')}</button><button class="button button-primary" type="submit">${t('save_changes')}</button></div></form>`);
    wrap.querySelector('#editProfileForm').addEventListener('submit',event=>{
      event.preventDefault(); const form=event.currentTarget;
      const target=state.users.find(u=>u.id===state.currentUserId); target.bio=form.elements.bio.value.trim(); delete target.bioKey;
      persist(); closeModal(); renderAll(); toast('profile_saved');
    });
  }
  function validateListing(form){
    clearFieldErrors(form); let valid=true;
    const title=form.elements.title.value.trim(),category=form.elements.category.value,condition=form.elements.condition.value,price=Number(form.elements.price.value),originalRaw=form.elements.originalPrice.value,original=Number(originalRaw),description=form.elements.description.value.trim(),location=form.elements.location.value.trim();
    if(!title||title.length>60){setFieldError(form,'title','listing_title_error');valid=false;}
    if(!category){setFieldError(form,'category','listing_category_error');valid=false;}
    if(!condition){setFieldError(form,'condition','listing_condition_error');valid=false;}
    if(!Number.isFinite(price)||price<=0){setFieldError(form,'price','listing_price_error');valid=false;}
    if(originalRaw&&(!Number.isFinite(original)||original<price)){setFieldError(form,'originalPrice','listing_original_error');valid=false;}
    if(!description||description.length>500){setFieldError(form,'description','listing_description_error');valid=false;}
    if(!location){setFieldError(form,'location','listing_location_error');valid=false;}
    return valid;
  }
  function handleListingSubmit(event){
    event.preventDefault(); const form=event.currentTarget; if(!validateListing(form)){const first=$('.is-invalid',form);first?.focus();return;}
    const values={title:form.elements.title.value.trim(),category:form.elements.category.value,categoryLabel:getCategoryLabel({category:form.elements.category.value}),condition:form.elements.condition.value,price:Number(form.elements.price.value),originalPrice:Number(form.elements.originalPrice.value)||Number(form.elements.price.value),description:form.elements.description.value.trim(),location:form.elements.location.value.trim(),delivery:form.elements.delivery.value,icon:({Books:'book-half',Electronics:'cpu',Fashion:'bag',Home:'lightbulb',Sports:'trophy',Other:'box-seam'})[form.elements.category.value],seller:currentUserName(),userId:currentUser().id,image:uploadedImage,images:[...uploadedImages]};
    const editing=editingListingId&&state.listings.find(row=>row.id===editingListingId); let item;
    if(editing){Object.assign(editing,values);item=editing;}else{item={id:uid('item'),...values,createdAt:Date.now(),likes:0};state.listings.unshift(item);}
    if(!persist()){if(!editing)state.listings.shift();return;}
    form.reset(); uploadedImage=''; uploadedImages=[]; $('#uploadPreview').innerHTML=''; $('#descriptionCount').textContent='0 / 500';
    const wasEditing=Boolean(editingListingId);editingListingId=null;const submit=form.querySelector('[type="submit"] [data-i18n]');if(submit){submit.dataset.i18n='publish_listing';submit.textContent=t('publish_listing');}
    marketState.page=1; renderAll(); toast(wasEditing?'listing_updated':'listing_created'); if(!wasEditing)addNotification('listing_live_title','listing_live_body',{listingId:item.id},'peach','arrow-up-right'); setPage('profile');
  }
  function handleImage(files){
    const error=$('[data-error="image"]'); setRuntimeText(error,'');
    const selected=[...(files||[])]; if(!selected.length)return;
    if(selected.length>4){setRuntimeText(error,'image_count_error');$('#itemImage').value='';return;}
    if(selected.some(file=>!['image/jpeg','image/png','image/webp'].includes(file.type))){setRuntimeText(error,'image_type_error');$('#itemImage').value='';return;}
    if(selected.reduce((sum,file)=>sum+file.size,0)>2*1024*1024){setRuntimeText(error,'image_size_error');$('#itemImage').value='';return;}
    Promise.all(selected.map(file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('read'));reader.onload=()=>resolve(String(reader.result));reader.readAsDataURL(file);})))
      .then(images=>{uploadedImages=images;uploadedImage=images[0]||'';$('#uploadPreview').innerHTML=images.map((src,index)=>`<img src="${src}" alt="${escapeHtml(t('gallery_image').replace('{current}',index+1).replace('{total}',images.length))}">`).join('');})
      .catch(()=>setRuntimeText(error,'image_read_error'));
  }
  // Delegated handlers keep controls working after dynamic cards are re-rendered.
  function bindEvents(){
    document.body.addEventListener('click',event=>{
      const pageButton=event.target.closest('[data-page]');
      if(pageButton){event.preventDefault();if(pageButton.closest('.modal-backdrop-custom'))closeModal();setPage(pageButton.dataset.page);return;}
      const verifiedInfo=event.target.closest('[data-action="verified-info"]');
      if(verifiedInfo){event.preventDefault();event.stopPropagation();openVerifiedInfo(verifiedInfo.dataset.userId);return;}
      const favorite=event.target.closest('[data-action="favorite"]');
      if(favorite){event.stopPropagation();toggleFavorite(favorite.dataset.id);return;}
      const detail=event.target.closest('[data-action="detail"]');
      if(detail){openListingDetail(detail.dataset.id);return;}
      const cat=event.target.closest('[data-category]');
      if(cat){marketState.category=cat.dataset.category;marketState.page=1;renderMarketplace();return;}
      const view=event.target.closest('[data-view]');
      if(view){marketState.view=view.dataset.view;renderMarketplace();return;}
      const period=event.target.closest('[data-period]');
      if(period){chartPeriod=period.dataset.period;renderChart();return;}
      const financeButton=event.target.closest('[data-finance-period]');
      if(financeButton){financePeriod=financeButton.dataset.financePeriod;renderPersonalDashboard();return;}
      const dashboardButton=event.target.closest('[data-dashboard-scope]');
      if(dashboardButton){dashboardScope=dashboardButton.dataset.dashboardScope;renderPersonalDashboard();return;}
      const lang=event.target.closest('[data-lang-choice],[data-auth-lang]');
      if(lang){state.settings.lang=lang.dataset.langChoice||lang.dataset.authLang;persist();applyLanguage();return;}
      const theme=event.target.closest('[data-theme-choice]');
      if(theme){state.settings.theme=theme.dataset.themeChoice;persist();applyTheme();toast('change_saved');return;}
      const notifTab=event.target.closest('[data-notif-filter]');
      if(notifTab){notifFilter=notifTab.dataset.notifFilter;renderNotifications();return;}
      const notif=event.target.closest('[data-notification-id]');
      if(notif){const n=state.notifications.find(row=>row.id===notif.dataset.notificationId);if(n){n.read=true;persist();renderNotifications();openNotificationDetail(n);}return;}
      const passwordToggle=event.target.closest('.password-toggle');
      if(passwordToggle){const input=passwordToggle.parentElement.querySelector('input');const visible=input.type==='password';input.type=visible?'text':'password';passwordToggle.innerHTML=`<i class="bi bi-${visible?'eye-slash-fill':'eye-fill'}"></i>`;passwordToggle.setAttribute('aria-pressed',String(visible));passwordToggle.dataset.i18nAriaLabel=visible?'hide_password':'show_password';passwordToggle.dataset.i18nTitle=visible?'hide_password':'show_password';passwordToggle.setAttribute('aria-label',t(passwordToggle.dataset.i18nAriaLabel));passwordToggle.setAttribute('title',t(passwordToggle.dataset.i18nTitle));return;}
      const demoLogin=event.target.closest('#demoLoginButton');
      if(demoLogin){login('alyarahman','juaija123');return;}
      const signup=event.target.closest('#showSignup');
      if(signup){const form=$('#signupForm');const loggingIn=!form.hidden;form.hidden=loggingIn;$('#loginForm').hidden=!loggingIn;$('.demo-card').hidden=!loggingIn;$('.auth-divider').hidden=!loggingIn;sessionStorage.setItem('juaija.authView',loggingIn?'login':'signup');const title=$('#authFormTitle');if(title){title.dataset.i18n=loggingIn?'sign_in_title':'create_account';title.textContent=t(title.dataset.i18n);}$('.signup-prompt').innerHTML=loggingIn?`<span data-i18n="new_to_juaija">${t('new_to_juaija')}</span> <button id="showSignup" data-i18n="create_account">${t('create_account')}</button>`:`<span data-i18n="account_exists">${t('account_exists')}</span> <button id="showSignup" data-i18n="sign_in">${t('sign_in')}</button>`;setRuntimeText($('#authError'),'');return;}
      if(event.target.closest('#usernameInfoButton')){openModal(`<article class="dialog-card username-info-dialog"><button class="dialog-close" data-close-modal aria-label="${escapeHtml(t('close_dialog'))}">×</button><i class="bi bi-info-circle-fill"></i><h2>${escapeHtml(t('username_info_title'))}</h2><p>${escapeHtml(t('username_rules_hint'))}</p></article>`);return;}
      if(event.target.closest('#editProfileButton')){openProfileEditor();return;}
      if(event.target.closest('#editAccountButton')){openAccountEditor();return;}
      if(event.target.closest('#privacyDetailsButton')){openPrivacyModal();return;}
      if(event.target.closest('#markAllRead')){state.notifications.forEach(n=>n.read=true);persist();renderNotifications();toast('marked_read');return;}
      if(event.target.closest('#signOutButton')){state.currentUserId=null;persist();showAuth();return;}
      if(event.target.closest('#resetDemoButton')){if(confirm(t('reset_confirm'))){state=freshState();StudentVerification.migrate(state);JuaijaOrders.migrate(state);persist();showApp();toast('reset_done');}return;}
      if(event.target.closest('#clearFilters')){marketState={...marketState,category:'all',search:'',page:1};$('#marketSearch').value='';renderMarketplace();return;}
      if(event.target.closest('#prevPage')){marketState.page=Math.max(1,marketState.page-1);renderMarketplace();return;}
      if(event.target.closest('#nextPage')){marketState.page+=1;renderMarketplace();return;}
      if(event.target.closest('#headerSearchButton')){setPage('explore');setTimeout(()=>$('#marketSearch').focus(),100);return;}
      const contact=event.target.closest('[data-action="contact-seller"]');
      if(contact){return;}
    });
    $('#marketSearch').addEventListener('input',event=>{marketState.search=event.target.value;marketState.page=1;renderMarketplace();});
    $('#sortSelect').addEventListener('change',event=>{marketState.sort=event.target.value;marketState.page=1;renderMarketplace();});
    $('#showCount').addEventListener('change',event=>{marketState.perPage=Number(event.target.value);marketState.page=1;renderMarketplace();});
    $('#verifiedOnly').addEventListener('change',event=>{marketState.verifiedOnly=event.target.checked;marketState.page=1;renderMarketplace();});
    $('#listingForm').addEventListener('submit',handleListingSubmit);
    $('#itemImage').addEventListener('change',event=>handleImage(event.target.files));
    $('#avatarImage')?.addEventListener('change',event=>{const file=event.target.files?.[0];if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>1024*1024)return;const reader=new FileReader();reader.onload=()=>{currentUser().avatar=String(reader.result);persist();updateIdentity();toast('change_saved');};reader.readAsDataURL(file);});
    $('#listingForm [name="description"]').addEventListener('input',event=>$('#descriptionCount').textContent=`${event.target.value.length} / 500`);
    $('#loginForm').addEventListener('submit',event=>{event.preventDefault();clearFieldErrors(event.currentTarget);setRuntimeText($('#authError'),'');login(event.currentTarget.elements.identity.value,event.currentTarget.elements.password.value);});
    $('#signupForm').addEventListener('submit',event=>{event.preventDefault();register(event.currentTarget);});
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape')closeModal();
      if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();setPage('explore');setTimeout(()=>$('#marketSearch').focus(),100);}
      if(event.key==='Enter'&&event.target.matches('[data-action="detail"]'))openListingDetail(event.target.dataset.id);
    });
  }

  function init(){
    try {
      $('#copyrightYear').textContent=new Date().getFullYear();
      $('#authCopyrightYear').textContent=new Date().getFullYear();
      StudentVerification.migrate(state);
      JuaijaOrders.migrate(state);
      const workflowApi={getState:()=>state,getUser:currentUser,t,format,escapeHtml,money,persist,onChange:renderAll,toast,uid,openModal,closeModal,badge:verifiedBadge};
      ordersController=JuaijaOrders.controller(workflowApi);
      verificationController=StudentVerification.controller(workflowApi);
      applyIcons(); bindEvents();
      window.addEventListener('storage',event=>{
        if(event.key!==STORAGE_KEY)return;
        state=loadState();StudentVerification.migrate(state);JuaijaOrders.migrate(state);
        if(isLoggedIn())showApp();else showAuth();
      });
      if(!state.settings)state.settings={lang:'ms',theme:'light'};
      if(!['ms','en'].includes(state.settings.lang))state.settings.lang='ms';
      if(!['light','dark'].includes(state.settings.theme))state.settings.theme='light';
      persist();
      if(isLoggedIn())showApp();else showAuth();
      document.documentElement.classList.remove('app-booting');
    } catch (error) {
      console.error('juaija failed to initialize:', error);
      $('#app').hidden=true;
      $('#authScreen').hidden=false;
      document.documentElement.classList.remove('app-booting');
    }
  }
  init();
})();
