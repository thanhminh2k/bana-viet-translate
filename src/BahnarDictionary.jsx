import { useMemo, useState } from "react";
import { ArrowLeftRight, Search } from "lucide-react";

const DICT_RAW = [["Ai","Số phận"],["Ai kojung","Tốt số"],["Ak","Con quạ"],["Ak","Qụa"],["Ak găm","Quạ đen"],["Akap","Cái bẫy"],["Akap kone","Bẫy chuột"],["Akap sem","Bẫy chim"],["Akap","Bẫy"],["anăk","Bẫy"],["Akar axeh","Da ngựa"],["Akar Djrang","Da báo"],["Akar kiěk","Da hổ"],["Akar klăn","Da trăn"],["Akar kopô","Da trâu"],["Akar romo","Da bò"],["Akar","Da, vỏ"],["kođoh","Da, vỏ"],["Ake","Cái sừng"],["Ake","Sừng"],["Ake kopô","Sừng trâu"],["Ake juěi","Gạc nai"],["Ake kotöng","Sừng hươu"],["Ake krŭ","Sừng bò tót"],["Ake mim","Sừng tê giác"],["Ake rơ mo","Sừng bò"],["Ako","Cái cổ"],["Ako","Cổ"],["hơko","Cổ"],["Akoh","Sàn"],["Akoh","Sạp"],["Akoh hnam kơ jung","Sàn nhà"],["drơh","Sàn nhà"],["Akoh sut","Sáp ong"],["jrěnh","Sáp ong"],["sal sut","Sáp ong"],["Akoh","Sáp"],["sal","Sáp"],["Akm chă pôm đon","Hiệp thương"],["Akou","Cơ thể"],["Akou kodih","Bản thân"],["kodih angla","Bản thân"],["Akou","Tập trung"],["jơnŭm đi đăng","Tập trung"],["pogou","Tập trung"],["hơ kŭn","Tập trung"],["Akôih sök","Cạo lông"],["Akôih sök kang","Cạo râu"],["hokôih sök kang","Cạo râu"],["Akôih sök nhüng","Cạo lông lợn"],["Along ba","Cây lúa"],["Along bơ o","Lồ ô"],["Along grê","Cây nghiêng"],["Alonh khôih","Cây dẻ"],["along pohe","Cây dẻ"],["Alo","Lớn","Kon anhong alo sonăm ưh?"],["Alô","A lô"],["Alô","Cái loa"],["Alo alâng","Cẩn thận"],["po alâng","Cẩn thận"],["Alop","Trẻ"],["alâp","Trẻ"],["Amăn tơ mam","Cất của"],["Amăn","Cất, để"],["ming","Cất, để"],["Amăng","Cổng"],["Amăng","Cửa"],["Amăng blŭng","Ban đầu"],["Amăng blŭng","Bắt đầu"],["pơ tơm","Bắt đầu"],["Amăng blŭng","Đầu tiên"],["kogol","Đầu tiên"],["blung","Đầu tiên"],["Amăng hnam","Cửa nhà"],["Amăng amok","Cửa sổ"],["Amăng polěi","Cổng làng"],["Amăng tăm p- phi zữ.","Lập tức"],["Amăng yang","Cổng trời"],["Amâm","Ngậm"],["amom","Ngậm"],["tong","Ngậm"],["Ame","Đút"],["Ame ăn oh","Cho em ăn"],["Ameh đök","Thích đọc"],["Ameh hiěk","Buồn cười"],["Ameh hiěk","Ngồ ngộ"],["Ameh tep","Buồn ngủ"],["Ameh wă","Ham thích"],["Ameh wă","Khao khát"],["Aměh","Thích"],["lŭ","Thích"],["Amě","Ô nhiễm"],["Amě amach","Bẩn thỉu"],["Amě hnam","Bẩn nhà"],["Amě jâng","Bẩn chân"],["Amě mach","Ô uế"],["Amě sôm ao","Bẩn quần áo"],["Amě ti","bẩn tay"],["Amě tomam","Bẩn đồ"],["Amě","Dơ bẩn"],["podơr","Dơ bẩn"],["Amêm bonat","Yêu thương"],["Amêm kơ eng","Yêu mến"],["Ami","Cơn mưa"],["Ami","Mưa"],["Ami hngach","Mưa dầm"],["Ami hngach","Mưa ngâu"],["Ami hngach","Mưa phùn"],["Ami hohŭt","Bão tố"],["Ami hohŭt","Mưa bão"],["Ami hohŭt tih","Bão táp"],["Ami hohŭt","Bão"],["hobŭt","Bão"],["Ami prěl","Mưa đá"],["Ami pru","Mưa rào"],["Ami pru","Mưa ròng"],["Amin","Åm"],["Amil","Gương"],["Amin ayök","Ảm lấy"],["amin ičk","Ảm lấy"],["Amin oh","Åm em"],["pôk","Åm em"],["Amin","Ăm"],["Amn ayok","Ăm lấy"],["Amin oh","Ăm em"],["pôk","Ăm em"],["Amlaih","Hối hận"],["Amlaih dêh đg","Tiếc lắm"],["Among đg","Trả nợ"],["Amonh tolěi","Bện dây"],["koxěnh tolěi","Bện dây"],["kŭi tơ lěi","Bện dây"],["Amonh","Bện"],["kơxěnh","Bện"],["Amônh đĩ","Dễ hết"],["Amônh hach","Dễ tàn"],["Amônh kơlôch","Dễ chết"],["Amônh","Dễ"],["bônh t","Dễ"],["Amơn","Với"],["Amơng","Làm ngơ"],["Amăi","Đã"],["kah","Đã"],["hlôi","Đã"],["Amră","Công"],["Amră","Con công"],["hơ mră","Con công"],["Amrě angam","Ớt ngọt"],["Adrěch sodang","Dân tộc Sê Đăng"],["Adral","Ranh giới"],["holam","Ranh giới"],["Adrăl","Bất tử"],["Adrăl","Tỉnh táo"],["hodrăl","Tỉnh táo"],["Adrěch bongai","Dân tộc"],["Adrěng ka","Chiên cá"],["Adrěng kotăp","Chiên trứng"],["Adrěng tơh","Chiên đậu"],["Adrěch drung","Họ hàng"],["kotum","Họ hàng"],["Adrěch hobo","Giống ngô"],["Adrěch ba","Giống lúa"],["hodrěch ba","Giống lúa"],["Adrěch","Giống"],["hodrěch","Giống"],["Adrěng","Chiên"],["Adrěng","Rán"],["Adrěng ka","Rán cá"],["Adrin drăi","Gắng gượng"],["Adrin","Chịu khó"],["chiu anat","Chịu khó"],["Adrin","Cố gắng"],["hodrin","Cố gắng"],["khöm adrin","Cố gắng"],["Adrih","Tươi"],["Adrih","Tươi sống"],["Adro","Ve"],["Adro axi","Ve kêu"],["Adro kăn","Goá vợ"],["hodro ko akăn","Goá vợ"],["Adro klo","Goá chồng"],["Adrol","Nháp"],["Adrő drăn","Cô độc"],["Adro","Một mình"],["hơ drỗ","Một mình"],["minh drỗ","Một mình"],["Adro","Xốc"],["Adrom","Để cho"],["Adrăm ăn sư","Để cho nó"],["Adruh","Thanh nữ"],["Adruh","Thiếu nữ"],["Adrŭng kč","Ổ chó"],["Adrŭg","Xóc"],["Adrŭng","Ố","Hnam inh đěi bar to adŭng iěr"],["hodrng","Ố","Hnam inh đěi bar to adŭng iěr"],["Agăm anhăng oh","Loạn luân"],["agăm g","Loạn luân"],["Aguăt","Bọ cạp"],["toguăt","Bọ cạp"],["Ahrěi","Hiện tại"],["Aně","Đừng"],["ně","Đừng"],["Ang","Ánh sáng"],["Ang","Ca ngợi"],["pơ ư","Ca ngợi"],["hori bonê","Ca ngợi"],["Angam","Ngọt"],["Angam sik","Ngọt đường"],["Angam băt","Ngọt ngào"],["Angam blě","Ngọt xớt"],["Angiěo","Bồ hóng"],["Angiěo","Trái"],["Angiět","Cỏ"],["Angiět adrih","Cỏ tươi"],["Angiět kro","Cỏ khô"],["Angok","Não"],["Angok","Óc"],["Angok bongai","Não người"],["Angok bongai","Óc người"],["Angok đök","Óc khỉ"],["Angok kö","Óc chó"],["Angok nhŭng","Óc lợn"],["Angok rơmo","Óc bò"],["Angok sem bri","Não thú"],["Angôch","Trọc"],["Angơn","Ngẩng"],["Angơn","Vươn"],["Angơn akou","Vươn mình"],["Angơn kơl","Ngẩng đầu"],["Angơn năng","Ngẩng xem"],["Anguaih","Dọn sạch"],["Anguaih","Ngoài"],["Anhanh anhap","Lảo đảo"],["Anhao măt","Rửa mặt"],["Anhao","Rửa"],["chho","Rửa"],["Anhek hât","Nhựa thuốc"],["Anhek tăng","Nhựa điếu"],["Anhěm iěr","Thịt gà"],["Anheng běng","Thèm bánh"],["Anheng","Thèm"],["kröddg","Thèm"],["Anhěp măt","Khinh bỉ"],["hơ reh","Khinh bỉ"],["areh","Khinh bỉ"],["Anih alâng","Nơi tốt"],["Anih amăn atou","Bãi tha ma"],["Anih arih sa","Nơi sinh sống"],["Anih botho","Lớp học"],["Anih donč","Nơi chốn"],["Anih tơ nơm ioh soang","Bộ Văn hoá"],["Anih jang","Nơi làm việc"],["Anih jang sa d","Bộ nông nghiệp"],["Anih khăm lăng j","Phòng Y tế"],["Anih kodră","Chỗ lãnh đạo"],["Anih kodră botho pojing","Bộ Giáo dục"],["Anih kojung","Chỗ cao cấp"],["Anih kotă","Nguyên quán"],["Anih oěi","Địa chỉ"],["Anih oěi","Thường trú"],["juăt oěi","Thường trú"],["Anih oěi","Chỗ ở"],["Anih oěi","Trú quán"],["Anih polôch","Pháp trường"],["Anih pơm","Phương pháp"],["Anih potao","Ngai vàng"],["Anih rogiěo","Đài phát thanh"],["Anih roneh","Nơi sinh"],["Anih tep","Phòng ngủ"],["Anih tơm joh suang","Sở Văn hoá"],["Anih tơm pogang","Sở Y tế"],["Anih tơm potâp plăng pơpěnh","Sở Thể dục Thể thao"],["Anih truh","Đích"],["Anih wěi jên","Ngân hàng"],["Anih wěi todrong botho","Phòng Giáo dục-Đào tạo"],["Anoh","Đó đây"],["Anoh","Kia"],["Anoh","Tự hào"],["ư ang","Tự hào"],["Anoh hěi","Ban nãy"],["Anoh","Đấy"],["klâp","Đấy"],["Anoh","Đó"],["noh","Đó"],["Anong","Rạ, rơm"],["Anong đak","Gánh nước"],["Anong todrong jang","Gánh nhiệm vụ"],["Atol hlakơ","Treo cờ"],["hotol hlako đg","Treo cờ"],["Atol","Treo"],["hotol","Treo"],["tol","Treo"],["Atop","Gói, bò sát-"],["Atop hât","Bó thuốc"],["Atop hât d","Gói thuốc"],["Ato băl","Bằng nhau"],["dang ăi","Bằng nhau"],["hoto","Bằng nhau"],["dôm ăi","Bằng nhau"],["Ato","Bằng"],["dang","Bằng"],["Atok đg","Đưa lên"],["Atök kojung","Nâng cao"],["Atok lăm","Lên lớp"],["Atök lăm gre","Lên xe"],["hao gre","Lên xe"],["Atăng","Cuống"],["Atöng hla","Cuống lá"],["Atong plěi along","Cuống quả"],["Avăt","Chim cút"],["Ayăt","Giặc"],["Ayăt","Kẻ thù"],["Axeh","Con ngựa"],["Axeh d","Ngựa"],["Axeh akăn","Ngựa cái"],["Axeh brông","Ngựa vằn"],["Axeh duih gre","Ngựa kéo xe"],["Axeh găm","Ngựa đen"],["Axeh hơi","Ngựa bạch"],["Axeh kotong","Ngựa đá"],["axeh kodah","Ngựa đá"],["Axeh tê","Ngựa phi"],["Axeh tono","Ngựa đực"],["Axêng","Cái nong"],["sêng","Cái nong"],["Áxi","Kêu"],["tokěch","Kêu"],["Axong","Ban phát"],["Axong bonê","Ban tặng"],["Axong khl","Chia nhóm"],["Ayom","Hiền"],["iâm","Hiền"],["Ayuh","Bốc hơi"],["Ayuh","Khí"],["Ayuh năr","Khí trời"],["Ayuh đak","Hơi nước"],["hoyuh đak","Hơi nước"],["Ayuh poyan","Khí tượng"],["Anong ba","Rạ lúa -"],["Anonh sök","Bện tóc"],["Anou ji","Đây là"],["ču ji","Đây là"],["Anou","Đây"],["he","Đây"],["Anŭng","Bọc"],["Anŭng anhěm","Gói thịt"],["Anŭng mơh","Bọc cơm"],["Anŭng","Gói"],["Anŭng mơ","Gói cơm"],["anŭng pddg đg","Gói cơm"],["Ao","Áo"],["Ao ami","Áo mưa"],["Ao djăl","Áo cộc"],["Ao dơ dui ti tai","Áo thun tay dài"],["Ao đâm","Áo đầm"],["Ao hoayuh djơ djih","Áo ướt đẫm"],["Ao hotăng","Áo mỏng"],["Ao hrăt","Áo chật"],["Ao kom plê","Áo com lê"],["Ao kơ jung","Áo dài"],["Ao koteh","Áo thêu"],["Ao lom kotih","Yếm"],["Ao phok","Áo mốc"],["Ao pokao","Áo hoa"],["Ao rohơi","Áo rộng"],["Ao sak","Áo len, áo khoác"],["Ao sơ mi","Áo sơ mi"],["Ao tăr","Áo mi ô"],["Ao ti djăl","Áo cộc tay"],["Ao ti tai","Áo dài tay"],["Ao tơno","Áo ấm"],["Ao tơno","Áo khoác"],["ao bang bă","Áo khoác"],["Ao trôk","Áo dơ"],["Ao wet","Áo vét"],["Apah","Trả công"],["Apah bơnê","Phần thưởng"],["Apah jang","Trả công làm"],["Apinh","Hỏi xin"],["Apinh","Xin"],["Anhěm","Thịt"],["Anhěm adrih","Thịt tươi"],["Anhěm hopok","Thịt thăn"],["Anhěm nhung","Thịt heo"],["Anhěm romo","Thịt bò"],["Anhě","Dễ khóc"],["Anhiět đah","Cỏ mọc"],["Anhik","Cái cuốc"],["Anhik chơlêng","Cuốc lớn"],["Anhik rơ uơ","Cái cày"],["rơ uơ","Cái cày"],["Anhik wăng","Cuốc cào"],["Anhik","Cuố"],["Anhip","Nhắm mắt"],["hiưp","Nhắm mắt"],["Anhöng alâng akou","Đẹp trai"],["Anhöng alâng ro","Anh đẹp trai"],["Anhöng bôl buăl","Anh bạn"],["Anhong dăm","Anh chàng"],["Anhong kodră","Anh cả"],["Anhong mai pôm bă mě","Anh chị"],["Anhong oh pôm bă mě","Anh em"],["Anhot","Rau"],["Anhot hla soběi","Rau cải"],["Anhot","Canh"],["Anhong","Anh"],["Anhöng anoh","Anh đó"],["Anhong anoh","Anh kia"],["Anhong oh pôm mẽ bă","Anh em ruột"],["Anhong oh pôm yă bok","Anh em họ"],["Anhong oh pôm yă bok","Anh em thúc bá"],["Anhong ču","Anh này"],["Anhrong","Đoạn cây"],["Anhrơng anhrât","Ngập ngừng"],["Anhui","Khói"],["Anhui golŭng","Khói um"],["anhui kolŭng","Khói um"],["Anhui hờt","Khói thuốc"],["Anhui ŭnh","Khói lửa"],["Anih","Chỗ"],["Anih","Nơi"],["Bơměnh go","Nhọ nồi"],["Bơmgai chữ","Người xấu"],["Bơmông","Lễ tang không hài cốt"],["Bơmot","Hướng tây"],["Bơmreh","Nhánh tre"],["Bona","Tù binh"],["Boneh","Tối đa"],["poneh","Tối đa"],["Bơnê","Cám ơn"],["Bơnê","Khen"],["Bonê kră alo","Mừng thọ"],["Bonê","Cảm ơn"],["ponê","Cảm ơn"],["Bơng","Bể"],["Bơng","Cái bể"],["Bơng","Cái máng"],["Bong đak","Bể nước"],["Bơng glơi","Bể bơi"],["Bơng ka","Bể cá"],["Bơng những","Máng heo"],["Bongai","Người -"],["Bongai alâng","Người tốt"],["Bongai alop","Trẻ con -"],["Bongai bahnar","Người bahnar"],["Bongai bu anoh","Kẻ nào đó"],["Bơngai chếp kol đăng đang","Bí thư"],["Bongai chih tobăt","Nhà báo"],["Bơngai chovong hokě","Người gầy"],["bongai hokě","Người gầy"],["Bongai donuh","Người nghèo"],["Bongai glăi","Phạm nhân"],["Bơngai hơrih","Dân cư"],["Bongai huăr gre par","Phi công"],["Bơngai iâm","Nhân hậu"],["Bơngai jang hnam kơmăi","Công nhân"],["kông nhân","Công nhân"],["Bongai jang mir","Nhà nông"],["Bongai jang mir na","Làm nông"],["Bơngai jang mir na","Nông dân"],["Bongai jř","Bệnh nhân"],["Bongai joh hơri","Nhạc sĩ"],["Bongai joh suang","Nghệ sĩ"],["Bobôn","Mịn màng"],["Bobo","Sờ mó"],["hobo","Sờ mó"],["Bobt","Xài"],["Bơbot jên","Xài tiền"],["Bobot","Tiêu xài"],["pohuach","Tiêu xài"],["hohoch","Tiêu xài"],["Bobring","San sát"],["Bobrot","Liên tục"],["pogrong","Liên tục"],["Bơbrök","Thầm thì"],["mơ mơnh","Thầm thì"],["Bobrong","Nằm thẳng"],["Bobŭk teh","Xúc đất"],["Bobŭk đg","Xúc"],["Bobŭk trôk","Xúc bùn"],["Bobŭng","Nóc, mái"],["Bơbŭng","Mái"],["Bobung hnam","Mái nhà"],["Bobŭng hnam","Nóc nhà"],["Bobŭng pok","Nóc kho"],["Bơh bơm","Lỡ"],["hơch","Lỡ"],["Bohle","Nghịch"],["Bohleng","Nghén"],["Bohngir","Mùi hôi"],["Bohngol","Hương hồn"],["Bơih","Rồi"],["Bờl hăl đg","Chán ngán"],["Bơla rôih","Ngà voi"],["pơla rôih","Ngà voi"],["Bolah","Tấm"],["Bolah phe","Tấm gạo"],["polah","Tấm gạo"],["Bolang","Trắng"],["Bolăm","Bàn tán"],["Bơlo","Sốt"],["Bơlôh","Cái lỗ"],["Bơloh","Thay phiên"],["boyong","Thay phiên"],["Bơlčk","Chì"],["polâk","Chì"],["Boluăn anăr","Nhật thực"],["drah luăn năr","Nhật thực"],["Bơluăn khěi","Nhật nguyệt"],["Boluăn khěi","Nguyệt thực"],["drah luăn khěi","Nguyệt thực"],["Boluăn","Nhật"],["rah luăn","Nhật"],["Bơlŭk","Quá nhiều"],["pogră kng","Quá nhiều"],["Choh pogar","Cuốc vườn"],["Chok","Khoét rãnh"],["Chok dih băl","Đấm nhau"],["Chok đing","Khoét ống"],["Chok","Đấm"],["hotop","Đấm"],["tŭr","Đấm"],["hotâp","Đấm"],["Chol","Chuôi"],["Chol săng","Chuôi dao"],["Chong","Phát"],["Chong anhiět","Phát cỏ"],["Chong hơnong ba","Phát rạ"],["Chong mir","Phát rẫy"],["Chong muih","Khai hoang"],["Chong muih","Phát hoang"],["Chop bơngai tơtông","Rình trộm"],["Chop kơne","Rình chuột"],["Chop mờng","Dò thám"],["Chor","Mạch"],["Chor hobong","Đào mương"],["Chor pham","Mạch máu"],["Chou","Bấu vứu"],["Chỗ","Buộc"],["Chỗ","Cột"],["Chỗ","Trói"],["Chỗ jơlak","Cột lạt"],["Chỗ những","Trói heo"],["Chỗ sok đg","Búi tóc"],["Chỗ tơlěi đg","Buộc dây"],["Chông ba đg","Dắt theo"],["Chông oh đg","Dắt em"],["Chông","Dắt"],["bơrơng","Dắt"],["kiěu","Dắt"],["Chôt brõk","Quay lại"],["Chôt brok","Trở lại"],["Chơ đg","Chở"],["Chơ d","Chợ"],["Chơ bơngai","Chở người"],["Chih tobăt","Hoá đơn"],["Chih todrong","Luận đề"],["Chih tolang","Bản thảo"],["Chih toroi","Viết phóng sự"],["Chih blök","Ghi nhớ"],["Chik","Dứa"],["Chik","Thơm"],["Chik đum","Dứa chín"],["Chik koxě","Dứa xanh"],["Chinh","Chiêng bằng"],["Chit kol todrong","Bịt đầu mối"],["Cht măt","Bịt mắt"],["Chit mu mã","Bịt mặt mũi"],["Chit ti","Bịt tay"],["Cht trôm","Bịt lỗ"],["Chit bờr","Bịt miệng"],["Ching","Cồng"],["Ching chêng","Cồng chiêng"],["Ching klơk","Đàn tơ rưng"],["Chĩt","Bịt"],["Chit","Trét kín"],["Chiu đg","Chịu"],["Chĩu kiờ","Giác ngộ"],["Chĩu lôch","Cảm tử -"],["Chiu lui","Tôn trọng"],["giă","Tôn trọng"],["yom","Tôn trọng"],["Chiu pomat","Chịu khổ"],["Chĩu pù","Chịu mang"],["Chĩu pŭ","Trách nhiệm"],["Chřu tơgm","Chịu giúp"],["Chĩu yoch","Chịu tội"],["Choh","Cuốc"],["Choh anhiět","Làm cỏ"],["Choh anhiět","Dãy"],["Choh chăn","Cuốc ruộng"],["Choh mir","Cuốc nương"],["Choh mir","Cuốc"],["Chêng klờng","Chiêng cải tiến"],["Chêng so","Chiêng cổ"],["Chhek chhök","Mâu thuẫn"],["Chhing","Sừng sững"],["Chho gờ","Rửa xoong"],["Chhờng","Vớt"],["Chhờng ičk ka","Vớt cá"],["Chhờnh","Thù hằn"],["Chhonh the","Thù đánh"],["Chhôk","Khoan khoái"],["Chho","Vẽ - đg"],["chih","Vẽ - đg"],["Chhơp rơngơp","Mát lòng"],["Chhơp","Mát"],["rơngơp","Mát"],["Chhờ bơngai","Vẽ người"],["Chho rup","Vẽ hình"],["Chhur","Đau lòng"],["hang nuih","Đau lòng"],["pơji","Đau lòng"],["Chhut hnam","Lau nhà"],["sut hnam","Lau nhà"],["Chhut kơ bang","Lau bàn"],["Chhut kơ bang găm","Lau bảng"],["Chhut tang do","Lau ghế"],["Chhut","Lau -"],["sut","Lau -"],["Chi tơbăt ăn","Đăng ký"],["Chih","Biên"],["Chih","Ghi"],["Chih","Viết -"],["Chih adrol","Viết nháp"],["Chih chư","Viết chữ"],["Chih dờng","Tái bút"],["Chih hla boar","Viết sách"],["Chih ičk","Ghi nhận"],["Chih jök","Biên nhận"],["Chih kơchěng","Tiểu luận"],["Chih măt","Viết tên"],["Chih pocheh","Tác giả"],["Chih pođok","Văn học"],["Chih pơsữ","Bút tích"],["Chih tơ bôh","Luận án"],["Che","Vải"],["Che","Giẻ"],["Che găm","Vải đen"],["Che kok","Vải trắng"],["Che nhêu","Khăn nhiễu"],["Che pokao","Vải hoa"],["Che sut cobang găm","Giẻ lau bảng"],["Che sut kobang","Giẻ lau bàn"],["Cheh","Nở"],["Chek","Đẻ nhiều"],["Chek lar","Sinh sản"],["Chem chom","Hiểm hóc"],["Cheng akou","Nghiêng mình"],["Cheng chong","Xếu mếu"],["Cheng găn","Buồng"],["Cheng găn","Ngăn cách"],["Cheng găn tep","Buồng ngủ"],["Cheng hluăn","Mai"],["Cheng hơkung","Mép"],["Cheng","Nghiêng"],["horêng","Nghiêng"],["goling","Nghiêng"],["Chep chep","Chíp chíp"],["Chếp ba","Giữ lấy; mang cùng"],["Chếp ba","Phát"],["Chěp kâl","Người đứng đầu cơ quan"],["Chěp kong kơ nol","Giao ước"],["Chěp kong kơ nol","Ký kết"],["Chěng ičk bri","Lấy rừng"],["Chěng ičk","Chiếm lấy"],["plah ičk","Chiếm lấy"],["Chěng song","Quy hoạch"],["Chěng sơlam","Chia ranh giới"],["Chèng","Ngăn"],["sih","Ngăn"],["Chếp","Cầm"],["Chếp","Đem"],["Chěp ba","Mang theo"],["hơrăng","Mang theo"],["Chê pơnê","Chế nhạo"],["Chêng","Chiêng"],["Chêng","Chiêng núm"],["Chă pơiăp","Đáp án"],["Chă pnhen","Tra khảo"],["Chă pơtơm","Huy động"],["Chă pơvao","Suy diễn"],["Chă sa","Kiếm ăn"],["Chă toblah","Hiếu chiến"],["Chă todrong","Gây chuyện"],["pojěi băl","Gây chuyện"],["Chă todrong hdoih","Kết hợp"],["Chă todrong rogěi","Kế hoạch"],["Chă tơhil","Gây sự"],["Chă tơmờng","Suy tâm"],["Chă toroi","Tiểu thuyết"],["Chă trong","Dò thăm"],["Chă trong","Tìm đường"],["Chă wăpơm","Đề tài"],["chih todrong","Đề tài"],["Chă yâu ka","Xúc cá"],["yòu ka","Xúc cá"],["Chăl","Thời kỳ"],["Chăl ahrěi","Hiện đại"],["Chăl ahrěi","Thời đại"],["Chăl dang i","Thời nay"],["Chăl hle","Thời đại mới"],["Chăl mình","Phần một"],["Chăl ning mônh","Thời sau"],["Chăl so","Thời trước"],["Chăl bar","Phần hai"],["Chăl","Đời"],["jơ hnơr","Đời"],["Chăr along ŭnh","Chẻ củi"],["Chăr hre","Chẻ mây"],["Chăr jolak","Chẻ lạt"],["Chăr pơm pêng","Chẻ làm ba"],["Chăr pơm bar","Chẻ làm đôi"],["Chăr","Chẻ"],["blah","Chẻ"],["Chăt alăng","Mọc tốt"],["Chăt","Nhú"],["bluh đg","Nhú"],["Chăt","Mọc"],["hon","Mọc"],["đah đg","Mọc"],["Châng","Cắt"],["kăt","Cắt"],["puăt","Cắt"],["ret","Cắt"],["yuă","Cắt"],["Châng","Chặt"],["Che","Trà"],["Char","Mèo rừng"],["Char","Tỉnh"],["Char chươh","Sa mạc"],["Char kông","Cao nguyên"],["Char kông","Vùng núi"],["Char teh","Địa hình"],["Char tih","Thành phố"],["Chă","Kiếm"],["Chă","Tìm"],["Chă akom","Quy tụ"],["Chă along ŭnh","Kiếm củi"],["Chă ăn","Tìm cho"],["Chă băt","Phát giác"],["Chă bôh","Phát hiện"],["Chă dăr","Tuần tra"],["dăr lăng","Tuần tra"],["Chă đon","Mưu kế"],["Chă hơdang","Mò tôm"],["Chă hơlěnh","Mưu mẹo"],["Chă hơmo","Tiên đoán"],["Chă hơvờ ka","Mò cá"],["Chă hơvờ","Mò mẫm"],["jơjờ","Mò mẫm"],["Chă huang","Đi dạo"],["Chă juang","Trinh sát -"],["Chă juang tơmang","Du lịch"],["chă ngôi","Du lịch"],["Chă kơchěng","Tâm trí"],["Chă kơchěng kodih","Suy nghĩ"],["kochěng","Suy nghĩ"],["tochěng","Suy nghĩ"],["totinh","Suy nghĩ"],["Chă kơdih","Tự tìm"],["Chă kodih","Tự lực"],["jang kơdih","Tự lực"],["Chă lăng đg","Thanh tra"],["Chă lua","Đi săn"],["hơnguang","Đi săn"],["chă druh","Đi săn"],["Chă mờng","Tình báo"],["Chă năng","Khảo sát"],["Chă năng","Kiểm soát"],["Chă năng","Quan sát"],["lăng hơlen","Quan sát"],["Chă oh","Tìm em"],["Chă pơang","Phô trương"],["Chă podăr","Mưu trí"],["Chă pơhrat","Phiền lòng"],["Chai","Cái chai"],["Chai","Cánh kiến"],["Chai alăk","Chai rượ"],["Chai đak","Chai nước"],["Chai đak măm","Chai nước mắm"],["Chai","Ném"],["Chaih hut","Ném đi"],["Chaih tơmo","Ném"],["Chak","Loang đuôi"],["Cham","Sân"],["Cham anhot","Bãi rau"],["Cham đã bằng lờng","Sân bóng đá"],["Cham gre par","Phi trường"],["donök","Phi trường"],["Cham gre păr","Sân bay"],["dợnăk","Sân bay"],["Cham hnam","Sân nhà"],["cham","Sân nhà"],["Cham kotao","Bãi mía"],["Cham ngôi","Sân chơi"],["Cham ngôi sök iěr","Sân cầu lông"],["Cham pah băng lờng","Sân bóng chuyền"],["Cham să","Quảng trường"],["Cham să","Sân vận động"],["Cham sỡk","Sân phơi"],["Cham","Bãi"],["tơ nok","Bãi"],["Chang","Mong"],["Chang","Trông chờ"],["Chang","Trông mong"],["Chang hmăng","Ngóng; sẵn sàng"],["Cháng bă wih","Mong bố về"],["Chao anhěm","Cháo thịt"],["Chao ka","Cháo cá"],["Chao klak","Cháo lòng"],["Chao kodăp","Cháo trứng"],["Chao kodim","Cháo hành"],["Chao ronŭng","Cháo lươn"],["Chao anhěm romo","Cháo thịt bò"],["Char","Cáo"],["Brâm đôh","Đạn nổ"],["Bre","Họ"],["Brě","Biền biệt"],["Brẽ pă bôh","Biệt tăm"],["Bri","Rừng"],["Bri kông","Rừng núi"],["Bri kodrong","Tài nguyên"],["Bri rơng","Rừng rậm"],["Bring brih","Nhá nhem"],["Bring brông","Kẻ ca rô"],["Bring brông","Loang lố"],["mak klěng","Loang lố"],["mêk","Loang lố"],["Bro pit","Dương cầm"],["Prot ba","Tuốt lúa"],["kěch ba","Tuốt lúa"],["Prt","Tuốt"],["kěch","Tuốt"],["Bro","Đài"],["Brok đăng hok","Đi học về"],["Brok tơ hnam","Về nhà"],["Broih","Ấu"],["Brơt","Khiếp vía"],["Bruh brah","Cẩu thả"],["brit t","Cẩu thả"],["Bruh ičk","Chụp lấy"],["chuěch ičk","Chụp lấy"],["hovơi","Chụp lấy"],["Bruh","Chụp"],["chuěch","Chụp"],["Brui","Cái cọ"],["Brul","Con dúi"],["sôk","Con dúi"],["Brunh","Tủm tỉm"],["Brŭ","Lễ bỏ mả"],["mât poxat","Lễ bỏ mả"],["Brung","Gỉ"],["goxang","Gỉ"],["Brừ","Điều ác"],["Brừ","Điều xấu"],["Buăl juăt","Bạn thân"],["Buch","Hạt tiêu"],["Buh","Ai"],["Buh anoh","Ai đó"],["Buk","Mền"],["Bung bang","Hoa sim"],["Bŭk","Mục"],["Bưh bưh","Mãi mãi"],["Bưh","Cũng được"],["kừm bưh","Cũng được"],["gơh mân","Cũng được"],["Botho hori","Dạy hát"],["Botho rogěi","Dạy giỏi"],["Bovang","Bao vây"],["wang dăr","Bao vây"],["povang","Bao vây"],["Bơvěnh","Cái xoáy"],["Bơvinh","Quanh quẩn"],["Poxat","Mả"],["Boyong","Xen kẽ"],["plang","Xen kẽ"],["tăh plang đg","Xen kẽ"],["Bơyong","Đi qua lại"],["Bơxuh","Múa kiếm"],["Bơxuh","Nô đùa"],["Boxŭn","Túp lều"],["poxŭn","Túp lều"],["Bo bơnờ","Đắp bờ"],["B bơnă","Đắp đập"],["Bờ jang alâng","Làm tốt"],["Bo jang","Làm việc"],["jang","Làm việc"],["Bờl","Chán"],["Bol sa","Chán ăn"],["Bỡng","Đậy"],["đờp","Đậy"],["klờp","Đậy"],["Brah brêng","Cà chua"],["pro kreng","Cà chua"],["Brai","Chỉ"],["Brai","Sợi chỉ"],["Brai bolang","Chỉ trắng"],["Brai dreng","Chỉ vàng"],["Brai gôh","Chỉ đỏ"],["Brai hobŭng","Chỉ đen"],["Brai jok","Chỉ xanh"],["Bral","Chừa"],["Bral","Chừa bỏ"],["Bral","Cách"],["uh tolir","Cách"],["Bral brot","Kinh hoàng"],["Bral tongal","Hoảng hốt"],["Bral tơrơ","Hoảng sợ"],["Bram","Mặt nạ"],["Bram","Râu dê đực"],["Brang","Cây gió bầu"],["Brang brah","Lấm tấm"],["Brăm","Tạm được"],["Brâk đg","Mủi lòng"],["Blông ŭnh đg","Bùng cháy"],["Blơch","Ngậy"],["Blờ","Lật"],["plð","Lật"],["tak","Lật"],["Blu","Đùi"],["Blu bâu","Bẹn hăm"],["Bluh","Đâm chồi"],["Bluh","Mọc mầm"],["Blŭk blŭk","Sùng sục"],["Blŭng","Tiến vào"],["Blŭng","Xông vào"],["Blư","Bỗng nhiên"],["Blu bla","Ồ ạt"],["Blưnhip","Lấp bóng"],["Bo","Lép"],["hobo","Lép"],["Bök trôm","Khoét lỗ"],["Bon kông","Dãy núi"],["Bon ring","Dãy"],["Bong","Bướu"],["Bong ko","Bướu cổ"],["Bong","Quan tài"],["hobong","Quan tài"],["Bop","Hóp"],["Bor","Mang thai"],["kiěu","Mang thai"],["Bor","Chửa"],["ưh kơhoh","Chửa"],["bŭng","Chửa"],["kiěu","Chửa"],["Bot","Gọn"],["Bot alâng","Ngăn nắp"],["Bot iao","Gọn gàng"],["Bòu ôm","Ôi"],["Bč","Quai bị"],["Bok","Đục"],["Bök","Khoét"],["Bok ak","Nách"],["Bök târ","Đục gỗ"],["Bong","Giống đực"],["Bouroi","Phao tin"],["Bôbông","Rộng tuếch"],["Bôi hla","Đống lá"],["Bỗi","Cái hũ"],["Bối","Hũ"],["Bongai jrai","Người jrai"],["Bongai khěch","Người tàu"],["Bongai kơih","Phóng viên"],["Bongai kojung","Người cao"],["Bongai komăl","Người đậm"],["Bongai komlo","Người câm"],["Bongai kon","Kẻ gian -"],["Bongai kopal teh","Nhân gian"],["Bongai kotul","Người dốt"],["Bongai lăng","Khán giả"],["Bongai nuih","Dũng sỹ"],["Bơngai pơm iông","Đại ca"],["Bongai poma","Người nói"],["Bongai pơma pơm jang holěnh","Người cáo già"],["Bongai pran","Lực sỹ"],["Bongai rogěi","Nhân tài"],["Bongai tök gre","Hành khách"],["Bongai wă","Đối tượng"],["Bongai wěi","Người bảo vệ"],["Bongai wěi","Người quản lý"],["Bơngai wơnh","Người điên"],["Bongai blo bloh","Người tham lam"],["bongai ham","Người tham lam"],["Ponhuăl","Tê tê"],["Bono","Cái đập"],["Bono","Con đê"],["Bonă","Kè"],["Bonŭng","Bánh tẻ"],["Bơnŭng","Non bánh tẻ"],["Bơo","Trương"],["Bơo","Trướng"],["Bơrơng","Dìu dắt"],["Bơrăng","Cố ý"],["pơhnăng","Cố ý"],["pơrăng","Cố ý"],["Botho","Dạy"],["Botho","Khuyên"],["khan","Khuyên"],["Botho akhan","Dạy bảo"],["Botho alăng","Dạy tốt"],["Botho ba","Khuyên răn"],["Botho hök","Dạy học"],["Bối","Vại"],["Bỗi alăk","Hũ rượu"],["Bỗi măm","Hũ mắm"],["Bôl","Bạn"],["Bôl buăl","Bạn bè"],["Bôl hök hdoih","Bạn học"],["Bôn kơne","Bắp thịt"],["Bôn kơne ti","Bắp tay"],["Bơ bôl","Thấy mờ mờ"],["Bơ lŭk","Dại"],["Bơ ngai gơh hơri","Ca sĩ"],["Bơ ngai kơně","Biến chất"],["Bo ngai sem bri","Cầm thú"],["Bơ ngai tơ tông","Kẻ cắp"],["Bơ ngai tơ tông","Kẻ cướp"],["Bơ ngai tông tơmam","Kẻ trộm"],["Bơ o klak","Trướng bụng"],["Bơ tho","Giáo dục"],["Bơ tho khan","Bảo ban"],["Bơ wih","Phục vụ"],["Bo đg","Sình","Anhong ji kiơ? inh bč klak."],["Bờ đg","Đắp"],["Bờ","Chắn"],["găn","Chắn"],["Bo jang","Công tác"],["Bo kla","Sình bụng"],["Bờ","Bờ"],["pơ nờ","Bờ"],["jih","Bờ"],["Bobah","Nam"],["Bobah","Hướng cửa sông"],["Bobâp","Lập cập"],["nă hal t","Lập cập"],["Bobe","Con dê"],["Bobe","Dê"],["Bobe akăn","Dê cái"],["Bobe bram","Dê đực đầu đàn"],["Bobe bri","Sơn dương"],["Bobe klo","Dê đực"],["Bơbe tơ tẫm","Dê húc nhau"],["Boblông","Ngùn ngụt"],["Bobong","Cái bình bầu"],["Bâr pơiôm","Ba hoa"],["Bâu khek","Tanh"],["Bâu phu dêh","Thơm quá"],["Bě","Nào"],["yơ","Nào"],["Bek","Béo"],["Bek","Béo tốt"],["Bek","Mập"],["plên","Mập"],["Bek alâng","Bụ mẫm"],["Bek dêh","Béo quá"],["Bek đak toh alâng","Bụ sữa"],["Bek thoi nhung","Béo như lợn"],["Bek tơ pă","Béo thật"],["Bek tơplě","Béo phệ"],["Ben","Diều"],["Ben iěr","Diều gà"],["Bề bân","Nào ta"],["Bi","Tàn nhang"],["Bi anhong","Còn anh"],["Bř mai","Còn chị"],["Bia","Nàng tiên"],["Bia hong","Cá sấu"],["bơ ya","Cá sấu"],["Biao","Sạch trơn"],["Biao","Sạch"],["Biao măt","Sạch mắt"],["Biao biônh","Sạch bóng"],["Bier","Bia"],["Bier chai","Bia chai"],["Bier hoyuh","Bia hơi"],["Bier long","Bia long"],["Bih","Nọc độc"],["Bih bih","Nọc rắn"],["Bih","Chất độc"],["bih kăm","Chất độc"],["Bioh","Đánh võ"],["Bioh","Võ"],["chok","Võ"],["Biông","Cái thùng"],["Bip","Con vit"],["Bř oh k","Còn em"],["Bih oh","Cùng em"],["Ayuh pran","Sức lực"],["jơhngỡm","Sức lực"],["Ayŭ hla soběi","Dưa cải"],["Ayŭ lěk kěk","Chua loét"],["Ayŭ","Chua"],["anhŭ","Chua"],["Axong pơm bar","Chia đôi"],["Aběng","Bánh -"],["běng","Bánh -"],["Ăm","Bá - đg"],["kuăr","Bá - đg"],["Ăn kơ e","Cho mày, cho bạn"],["Ăn kơ inh","Cho tôi"],["axong inh","Cho tôi"],["Ăn kơ oh","Cho em"],["Ăn pơlung","Hối lộ"],["pogăm đg","Hối lộ"],["Ăt","Cái ách"],["Ă ji dêh","Ái"],["Ăn","Cấp phát"],["Ăn","Đưa"],["Ăn bơnê","Ban ơn"],["Ăn bơnê","Biếu"],["Ăn bơnê","Đãi ngộ"],["Ăn kơ anhõng","Cho anh"],["Ăn sa","Cho ăn"],["hiěm","Cho ăn"],["tơ ane","Cho ăn"],["Ăn běng","Cho bánh"],["Ăn","Cho"],["axong","Cho"],["song","Cho"],["Nar blŭng","Ngày khai mạc"],["Ânhěm ôm","Thị thối"],["Âp bum","Luộc khoai"],["hotŭk bum","Luộc khoai"],["pai bum","Luộc khoai"],["ðp bum","Luộc khoai"],["Âr ăr","Xôn xao"],["Ăt","Ách - d"],["Ât kơ por","Nhịn đói"],["ât kơ mơh","Nhịn đói"],["Ăt rơmo","Ách bò"],["apo brư","Ách bò"],["Ât","Ngột ngạt"],["ěnh","Ngột ngạt"],["Âl ol","Nghẹn ngào"],["Ât hiâng","Lưỡng lự"],["Ât jơ hngăm","Nín thở"],["ăt jơhngăm đg","Nín thở"],["Ba akou đg","Hiến thân"],["Ba ăn đg","Đưa cho"],["Ba mơh đg","Đưa cơm"],["Ba mơh atâu","Đưa cơm người chết"],["Ba năr","Truyền lời"],["Ba nờr","Truyền thanh"],["Ba trong","Dẫn đường"],["Bah","Thoa"],["Bah đak","Cửa sông, suối"],["Bah đak","Hạ lưu"],["Bah đak bou","Thoa nước hoa"],["Bai","Cái sọt"],["Bai tobinh","Nôi"],["Bang","Rõ"],["Bar","Chiều rộng"],["Bar pah","Hai bên"],["Băt axong","Biết cho"],["Băt băi","Biết được"],["Băt bơih","Biết rồi"],["Băt bơnê","Biết ơn"],["Băt dang","Biết chừng nào"],["Băt glăi","Biết tội"],["Băt hlôh","Nhận thức"],["Băt hodrol","Biết trước"],["Băt hodrol đg","Tiên tri"],["Băt hơlăng","Hiếu thảo"],["gơh băt kơ mě bă","Hiếu thảo"],["Băt nhen","Biết rõ"],["Băt pôk","Biết bưng"],["Băt rơđah","Biết chính xác"],["Băt todrong jang","Biết việc"],["Băt topăt","Biết sự thật"],["Băt topăt","Ngay thẳng"],["Băt boh","Mặn muối"],["Băt bôh","Làm chứng"],["Băt","Biết"],["gơh","Biết"],["Bătyă t","Biết điều"],["Bâ","Chúng mình, chúng ta"],["ba","Chúng mình, chúng ta"],["Bân","Ta"],["Bân năm","Ta đi"],["bân yak","Ta đi"],["Amrě axě","Ơt xanh"],["Amrě đum","Ơt chín"],["Amrě ho","Ơt cay"],["Amrě ak","Ớt quạ"],["Amrě kok","Ớt trắng"],["Amrě ngěng","Ớt bay"],["Amui golŭng","Bụi mù"],["An","Án"],["An d","Yên","An gre bobit."],["An axeh","Yên ngựa"],["An gre","Yên xe"],["Anam","Chuỗi hạt"],["Anam hu","Chuỗi bạc"],["Anam mah","Chuỗi vàng"],["Anao đang","Mới xong"],["Anao wih","Mới về"],["Anao yak","Mới đi"],["Braih anao","Mới tinh"],["Anao","Mới"],["hle","Mới"],["plng","Mới"],["Anau hơiơch","Mới đẻ"],["Anau tođah","Mới nảy mầm"],["Ană anap","Phấn khởi"],["hal","Phấn khởi"],["phok","Phấn khởi"],["Ană hddg","Sôi nổi"],["Ană hal","Vui mừng"],["Ană","Mừng"],["iă","Mừng"],["Anăn d","Tên","Oh anăm măt bu?"],["Anăn bu","Tên gì"],["Anăn kodih","Danh từ riêng"],["Anăn măt","Họ và tên"],["Anăn pođī","Danh từ chung"],["anăn măt plěi nâr hobī","Danh từ chung"],["Anăn toplih","Bí danh"],["Anăng blŭng","Tưới tiêu"],["Anăng tơm","Lối ra"],["Anâm","Ấp"],["anăm","Ấp"],["Aně bohle","Đừng nghịch"],["Aně ngor","Đừng phá"],["Aně pơm","Đừng làm"],["Aně yak","Đừng đi"],["năm ně","Đừng đi"],["Apinh jet","Xin hỏi"],["Apo konê","Ác mộng"],["Apo đg","Mê, mơ","Măng hrẽi ĩnh tep apo bôh anhõng."],["Apo bôh","Mơ thấy"],["Apơi đg","Ước mơ"],["Apŭng","Huyện"],["pŭng","Huyện"],["Arăng","Cứng"],["horăk","Cứng"],["khăng","Cứng"],["Arăng găng","Cứng cỏi"],["kodăng","Cứng cỏi"],["hơ rök","Cứng cỏi"],["Arăng grăng","Khoẻ mạnh"],["grăng akâu","Khoẻ mạnh"],["Arăng","Cứng cáp"],["djrăng","Cứng cáp"],["Areh dêh","Ghét lắm"],["Areh","Ghét"],["hơreh","Ghét"],["Areng","Cua"],["Areng đak doxi","Cua biển"],["Areng tona","Cua đồng"],["Areng","Con cua"],["kotam","Con cua"],["Arih dg","Sống"],["Arih dunh","Sống lâu"],["jonoi sot","Sống lâu"],["arih sot","Sống lâu"],["Arih sa","Đời sống"],["Arih sa","Sinh sống"],["Arih sa rogěi","Sức sống"],["Arih sot","Sống thọ"],["Ataih","Hẻo lánh"],["Ataih băl","Xa nhau"],["Ataih dêh","Xa lắm"],["Ataih kơ hnam","Xa nhà"],["Ată","Nhắn"],["Ată ăn","Gửi cho"],["Ată nâr","Nhắn tin"],["Atăr reo","Quai gùi"],["tăr hokăt","Quai gùi"],["Atâng brai","Khung dệt vải"],["Atâu","Ma"],["atău","Ma"],["Ate","Bột nấu thịt"],["Athěi","Hãy"],["Athěi jet","Hãy hỏi"],["Athěi pơm","Khuyên làm"],["Athěi poma","Hãy nói"],["Athěi","Bảo"],["khan","Bảo"],["wơh","Bảo"],["Bing kơ kial","Khuất gió"],["Bla","Lá lách"],["kăng","Lá lách"],["Blach","Yết hầu"],["dang holong","Yết hầu"],["Blah","Bổ"],["Blah","Phá vỡ"],["Blah","Tấm"],["Blah along ŭnh","Bổ củi"],["Blah ayăt","Đánh giặc"],["toblah","Đánh giặc"],["Blah che","Tấm vải"],["Blah ir","Mổ gà"],["Blah kolâp","Đánh úp"],["Blah kram","Chẻ tre"],["Blah nhũng","Mổ heo"],["Blah rơ mo","Mổ bò"],["Blah torar","Xâm lược"],["Blah","Chiếc"],["pôm","Chiếc"],["tong","Chiếc"],["Blai běnh","Tràn đầy"],["Blai","Ăm ắp"],["momân","Ăm ắp"],["Blang pơ kau đg","Nở hoa"],["Blang","Nở"],["pơpông","Nở"],["Blăl","Tục"],["Blěk","Lên cơn tức"],["Blep","Chính xác"],["đam","Chính xác"],["đum","Chính xác"],["Blěi","Chửi"],["Blěi blăl","Chửi tục"],["Blẽi kơ bă, mẽ","Chửi cha, mẹ"],["Blěk","Tức"],["Blěk ơh","Bực tức"],["ơh mil","Bực tức"],["suek","Bực tức"],["yo","Bực tức"],["Blo","Trái blo"],["Blong sung","Cán rìu"],["Blong","Cán"],["gor","Cán"],["Blờng blẽnh","Lỏng lẻo"],["Blôk","Sôi"],["Blôk","Bọt"],["kơmuh","Bọt"],["Blôk đak","Bọt nước"],["komuh đak","Bọt nước"],["Blông","Bùng"],["Blông","Nói khoác"],["Blông đôh","Bùng nổ"],["Along dopang","Cây dầu"],["Along drih","Đa"],["along jri","Đa"],["Along duơh","Đũa"],["Along gao","Cây dừa"],["Along gong","Cây cầu"],["bor","Cây cầu"],["gơng","Cây cầu"],["Along hongo","Cây thông"],["Along honong","Đòn"],["Along hopuih","Chổi"],["Along hobo","Cây ngô"],["Along jing","Cây tốt"],["Along jra","Gậy"],["Along jri","Cây đa"],["Along ke rěk","Ke"],["Along khir","Cái bừa"],["Along khir","Cái cào"],["Along khir","Cào"],["Along köng","Cái cân"],["Along kotao","Cây mía"],["Along kotonh","Cây dương xỉ"],["Along kram","Cây tre"],["Along krăk","Gỗ trắc"],["Along kreng","Cây mận"],["Along krěng","Cây trầm"],["Along kro","Cây khô"],["Along pok","Cây ngã"],["Along po o","Cây lồ ô"],["Along pogang","Cây thuốc"],["Along pole","Cây le"],["Along pole","Le"],["Along poto","Thước đo"],["Along rek","Cái thước"],["Along rek","Thước kẻ"],["Along ronhong","Cây cao"],["Along sa plěi","Cây ăn quả"],["Along sor","Lò xo"],["Along trang","Cây lau"],["Along trang","Lau"],["Along ŭnh","Củi"],["reh","Củi"],["Akôih","Cạo"],["hokôih","Cạo"],["Akơn","Bục"],["Akơn botho","Bục giảng"],["Akum hodai","Hội nghị"],["Akung sem","Mỏ chim"],["Akŭng","Môi"],["hokŭng","Môi"],["sokŭng","Môi"],["Akŭng","Mỏ"],["sokŭng","Mỏ"],["Alah","Lười"],["Alah","Lười biếng"],["holah","Lười biếng"],["Alal","Ông sáo"],["Alal","Sáo"],["Alao","Nứa"],["phat","Nứa"],["Alăk","Rượu trắng"],["Alăk bou khôi","Rượu khê"],["Alâng","Tốt"],["Alâng akâu","Bổ"],["Alâng akâu","Bổ dưỡng"],["Alâng dêh","Tốt lắm"],["Alâng gloh","Tốt hơn, tốt lắm"],["Alâng hođăl","Xinh xắn"],["Alâng lăp","Đẹp mắt"],["Alâng liěm","Tốt đẹp"],["Alâng rõ","Kì diệu"],["Alâng rõ","Lộng lẫy"],["Alâng rõ","Nguy nga"],["Alâng rơhong","Xinh tươi"],["Alâng topă","Tốt thật"],["Aleh","Dính"],["hrp","Dính"],["Along","Cây"],["Along bơm","Bơm"],["Along adrih","Cây tươi"],["Along chi","Bút"],["Along chi","Bút chì"],["Along chi","Cây bút"],["Along chi đak mŭk","Bút mực"],["Along chơ choh","Cái thớt"],["Along chovêu","Cây cong"],["along đong","Cây cong"],["Along chrah","Cây cọ"],["Ala kơ hnam","Dưới nhà"],["Ala","Dưới"],["korôm","Dưới"],["sŭng","Dưới"],["Anăn plei nâr","Danh từ"],["anăn plěi năr","Danh từ"],["Anăr dơmônh","Ngày mốt"],["tơmônh","Ngày mốt"],["Anăr pogê","Lúc sáng"],["Anăr toning","Ngày mai"],["doning","Ngày mai"],["Ataih yaih","Heo hút"],["Aběn","Váy"],["Aběn","Quần"],["Abou đak doxř","Ốc biển"],["Abou iě","Ốc vặn"],["Abou lê","Ốc bươu"],["Abou lê dreng","Ốc bươu vàng"],["Achăng","Thả"],["Achăng","Bỏ đi"],["hŭt lề","Bỏ đi"],["Achăng ăn","Khoan hồng"],["Achăng hiơt","Bỏ quên"],["Achăng hut","Bãi bỏ"],["Achăng hut","Buông luôn"],["Achăng kơpô","Thả trâu"],["Achăng lễ","Bãi miễn"],["Achăng lễ","Buông xuôi"],["Achăng ti","Buông tay"],["Achăng ti","Thả tay"],["Achăng tŭk","Bỏ luôn"],["Achő along ŭnh g","Bó củi"],["Achő anhot","Bó rau"],["Achỗ","Bó"],["hơ chỗ","Bó"],["Adar","Nhẹ nhàng"],["do dar","Nhẹ nhàng"],["todar","Nhẹ nhàng"],["hodar","Nhẹ nhàng"],["Adra","Giàn xới"]];

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

function Highlighted({ text, query }) {
  if (!query) return <>{text}</>;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="hl">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export default function BahnarDictionary() {
  const [direction, setDirection] = useState("bv"); // 'bv' = Bahnar->Viet, 'vb' = Viet->Bahnar
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const map = new Map();
    for (const row of DICT_RAW) {
      const bana = row[0];
      const viet = row[1];
      const example = row[2];
      const src = direction === "bv" ? bana : viet;
      const tgt = direction === "bv" ? viet : bana;
      const key = normalize(src);
      if (!key) continue;
      if (!map.has(key)) {
        map.set(key, { display: src, meanings: [], examples: [] });
      }
      const g = map.get(key);
      if (!g.meanings.includes(tgt)) g.meanings.push(tgt);
      if (example && !g.examples.includes(example)) g.examples.push(example);
    }
    return map;
  }, [direction]);

  const entryCount = useMemo(() => {
    const s = new Set();
    DICT_RAW.forEach((r) => s.add(normalize(r[0]) + "|" + normalize(r[1])));
    return s.size;
  }, []);

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    const starts = [];
    const includes = [];
    for (const [key, g] of grouped) {
      if (key.startsWith(q)) starts.push({ key, ...g });
      else if (key.includes(q)) includes.push({ key, ...g });
    }
    const byLenThenAlpha = (a, b) => a.key.length - b.key.length || a.key.localeCompare(b.key);
    starts.sort(byLenThenAlpha);
    includes.sort(byLenThenAlpha);
    return [...starts, ...includes].slice(0, 60);
  }, [query, grouped]);

  const srcLabel = direction === "bv" ? "Tiếng Bahnar" : "Tiếng Việt";
  const tgtLabel = direction === "bv" ? "Tiếng Việt" : "Tiếng Bahnar";
  const placeholder =
    direction === "bv" ? "Nhập từ Bahnar, ví dụ: akap, ake, along…" : "Nhập từ tiếng Việt, ví dụ: bẫy, sừng, cây lúa…";

  function swap() {
    setDirection((d) => (d === "bv" ? "vb" : "bv"));
  }

  return (
    <div className="bd-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

        :root {
          --bg: #1c1810;
          --surface: #26201a;
          --surface-2: #2f2721;
          --border: #4a3c2a;
          --border-soft: #3a2f22;
          --accent-red: #b23a2e;
          --accent-red-dim: #7d2a22;
          --accent-ochre: #cf9f3e;
          --text: #f2e9d8;
          --text-muted: #a3937a;
        }

        .bd-root {
          font-family: 'Be Vietnam Pro', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100%;
          padding: 28px 16px 40px;
          box-sizing: border-box;
        }
        .bd-root * { box-sizing: border-box; }

        .bd-shell {
          max-width: 880px;
          margin: 0 auto;
        }

        .bd-header {
          text-align: center;
          margin-bottom: 6px;
        }
        .bd-title {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: 34px;
          letter-spacing: 0.2px;
          margin: 0;
          color: var(--text);
        }
        .bd-title .amp {
          color: var(--accent-ochre);
          font-style: italic;
          font-weight: 500;
        }
        .bd-subtitle {
          color: var(--text-muted);
          font-size: 14px;
          margin-top: 6px;
        }

        .bd-weave {
          height: 10px;
          margin: 18px auto 22px;
          max-width: 880px;
          background:
            repeating-linear-gradient(
              -45deg,
              var(--accent-red) 0px, var(--accent-red) 8px,
              var(--accent-ochre) 8px, var(--accent-ochre) 16px,
              var(--bg) 16px, var(--bg) 20px
            );
          opacity: 0.85;
          border-radius: 2px;
        }

        .bd-panels {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          align-items: stretch;
        }
        @media (max-width: 680px) {
          .bd-panels { grid-template-columns: 1fr; }
          .bd-swap { transform: rotate(90deg); }
        }

        .bd-panel {
          background: var(--surface);
          border: 1.5px solid var(--border-soft);
          border-radius: 8px;
          padding: 16px 18px 18px;
          display: flex;
          flex-direction: column;
          min-height: 340px;
        }

        .bd-panel-label {
          font-size: 12.5px;
          color: var(--accent-ochre);
          font-weight: 600;
          margin-bottom: 10px;
          font-family: 'Be Vietnam Pro', sans-serif;
        }

        .bd-input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 19px;
          resize: none;
          width: 100%;
          min-height: 90px;
          line-height: 1.5;
        }
        .bd-input::placeholder { color: var(--text-muted); opacity: 0.75; }

        .bd-count {
          margin-top: auto;
          padding-top: 10px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .bd-swap-wrap {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 3;
        }
        .bd-swap {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background: var(--accent-red);
          border: 3px solid var(--bg);
          color: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 0 0 1px var(--border-soft);
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .bd-swap:hover { background: var(--accent-red-dim); transform: translate(0,0) scale(1.06); }
        .bd-swap:active { transform: scale(0.94); }

        .bd-results {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 4px;
          max-height: 320px;
        }
        .bd-empty {
          color: var(--text-muted);
          font-size: 14px;
          margin-top: 8px;
          line-height: 1.6;
        }
        .bd-card {
          border: 1px solid var(--border-soft);
          border-radius: 6px;
          padding: 10px 12px;
          background: var(--surface-2);
        }
        .bd-card-word {
          font-family: 'Fraunces', serif;
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
        }
        .bd-card-meanings {
          margin: 6px 0 0;
          padding-left: 18px;
          color: var(--text);
          font-size: 15px;
          line-height: 1.55;
        }
        .bd-card-meanings li::marker {
          color: var(--accent-ochre);
        }
        .bd-card-example {
          margin-top: 6px;
          font-size: 13px;
          color: var(--text-muted);
          font-style: italic;
        }
        .hl {
          background: var(--accent-ochre);
          color: #23180c;
          padding: 0 1px;
          border-radius: 2px;
        }

        .bd-footer {
          text-align: center;
          margin-top: 22px;
          color: var(--text-muted);
          font-size: 12.5px;
        }
      `}</style>

      <div className="bd-shell">
        <div className="bd-header">
          <h1 className="bd-title">
            Bahnar <span className="amp">·</span> Việt
          </h1>
          <p className="bd-subtitle">Từ điển đối chiếu Bahnar – Tiếng Việt</p>
        </div>

        <div className="bd-weave" />

        <div className="bd-panels">
          <div className="bd-panel">
            <div className="bd-panel-label">{srcLabel}</div>
            <textarea
              className="bd-input"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              spellCheck={false}
            />
            <div className="bd-count">{entryCount.toLocaleString("vi-VN")} mục từ trong từ điển</div>
          </div>

          <div className="bd-swap-wrap">
            <button className="bd-swap" onClick={swap} aria-label="Đổi chiều dịch" title="Đổi chiều dịch">
              <ArrowLeftRight size={20} />
            </button>
          </div>

          <div className="bd-panel">
            <div className="bd-panel-label">{tgtLabel}</div>
            {results.length === 0 ? (
              <div className="bd-empty">
                {query.trim()
                  ? "Không tìm thấy từ phù hợp trong từ điển."
                  : "Kết quả tra cứu sẽ hiện ở đây."}
              </div>
            ) : (
              <div className="bd-results">
                {results.map((r) => (
                  <div className="bd-card" key={r.key}>
                    <div className="bd-card-word">
                      <Highlighted text={r.display} query={query} />
                    </div>
                    <ul className="bd-card-meanings">
                      {r.meanings.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                    {r.examples.length > 0 && (
                      <div className="bd-card-example">{r.examples[0]}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bd-footer">
          Tra cứu theo từ · gõ để tìm các từ bắt đầu hoặc chứa nội dung bạn nhập
        </div>
      </div>
    </div>
  );
}
