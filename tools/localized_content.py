"""Maintained Japanese, Chinese and Vietnamese summaries of current products.

Localized routes are generated statically. Detailed device guides link to their
English originals rather than silently presenting an old translated release.
"""
CONTENT = {
 'ja': {
  'home': ['学びのために。家族の時間のために。','Layers は教室向けツールと家庭向けの端末管理を提供します。Guard Family は Windows PC と Android 端末を保護者用ダッシュボードから管理。教室では Windows の Teacher と Student 拡張機能を使います。','目的に合う Layers を選ぶ','Guard Family','保護者はブラウザ、または Android の Controller で管理します。子供の Windows PC には Guard Desktop、Android 端末には Guard Mobile を設定してペアリングします。','Layers Classroom','Windows の Teacher で字幕・音声翻訳、タイマー、ランダム選択、画面への描画を利用。Student 拡張機能では辞書、読み上げ、翻訳、メモ、教室への接続を利用できます。','ブラウザ向け Guard','無料の Guard 拡張機能はブラウザ内で設定する別の製品です。ウェブサイト制限、利用時間帯、ページの内容チェックに対応し、家庭用ダッシュボードとは接続しません。'],
  'guard': ['端末のルールを、家族のリズムに。','Windows と Android の子供用アプリをペアリングし、ブラウザのダッシュボード、または Android Controller から利用時間、アプリ、ウェブサイトのルールを管理します。','毎日のルールをひとつの画面から','利用時間と予定','1 日の利用時間、アプリごとの上限、就寝時間、平日・週末の予定を設定できます。保存されたルールは子供用アプリで適用します。','アプリとウェブサイト','ブロックリストと利用可能な時間帯を設定し、インターネットの一時停止や端末のロックを指示できます。新しい遠隔操作には接続が必要です。','子供からのリクエスト','子供は時間の延長やアプリ・サイトへのアクセスを申請でき、保護者は承認・拒否できます。利用履歴や内容の警告は補助情報であり、検出は完全ではありません。','はじめに設定すること','現在の Windows / Android ビルドについてお問い合わせください。保護者主導で必要な権限を設定します。','子供用アプリに表示される現在のペアリングコードをダッシュボードに入力します。コードには有効期限があります。','接続と保護の状態を確認し、利用時間・就寝時間・制限を設定します。オンライン表示だけでは十分な保護を意味しません。'],
  'get': ['現在の Layers を利用する','製品構成が変わっています。以前のダウンロードを使う前に、現在のビルドと設定方法についてお問い合わせください。価格と購入リンクは現在掲載していません。','利用したいツールを選ぶ','Guard Family','Windows と Android の子供用アプリを、保護者用のウェブダッシュボードまたは Android Controller で管理します。','Layers Teacher','Windows 専用の教室ツールです。現在のソースは v3.18 ですが、以前の公開ダウンロードがこのバージョンとは限りません。','Student とブラウザ Guard','無料の学習拡張機能と、別製品のブラウザ内保護拡張機能です。正しい拡張機能の利用方法をご案内します。','既存のライセンスをお持ちですか？','アプリやダッシュボードの入力画面で既存のキーを使えます。認証に問題がある場合は製品名、バージョン、注文番号をお知らせください。Windows の 14 日間試用はローカルで管理され、試用終了による自動課金はありません。'],
  'support': ['Layers の利用と設定をサポート','教室のルーム接続、ブラウザ内保護、家庭の端末ペアリングは別の仕組みです。お使いの製品を確認してください。','よくある質問','接続中なのに保護に注意が必要','必要な権限や起動状態によって保護が制限されることがあります。ダッシュボードの保護状態と子供用アプリの診断を確認してください。','ペアリングコードが使えない','コードには有効期限があります。子供用アプリに現在表示されているコードを、同じ保護者アカウントで使用してください。','身に覚えのない請求','領収書のサービス名、日付、製品名、注文番号をお知らせください。カード情報などは隠してください。アプリ名だけでは請求元を特定できません。','フォームから送信できない','お問い合わせフォームはメールの下書きを作ります。メールアプリで送信するか、ウェブメールにコピーしてください。サイトから直接メールを送信する仕組みではありません。'],
  'soho': ['Layers Talk は旧製品です。','独立した Layers Talk は現在の製品構成に含まれません。Windows の Teacher と、Windows / Android 向け Guard Family に開発を集中しています。','以前のライセンスについて','以前のビルドや注文については製品名、バージョン、注文番号を添えてお問い合わせください。現在の Teacher の音声翻訳は教室向けで、以前の対面会議翻訳とは異なる使い方です。'],
  'install': ['教室をルームコードでつなぐ','Windows の Teacher と、Chrome / Edge の Student 拡張機能を使用します。正しい現在のビルドについてお問い合わせください。','教室の設定手順','Windows の Teacher と Student 拡張機能を用意し、教師アプリの Classroom でルームを作成します。','学生は対応するウェブページで Student を開き、ルームコードを入力します。','リンクの送信とヘルプリクエストを試し、必要に応じて Focus Mode、サイト制限、予定を設定します。','教室用のコードは Guard Family のペアリングコードとは異なります。制限は参加しているブラウザに適用され、コンピューター全体を管理するものではありません。'],
  'status': 'Windows と Android が現在の開発対象です。Mac アプリは提供終了しました。Mac の対応ブラウザで保護者用ダッシュボードを開くことはできます。',
  'limits': '保護には、子供用アプリが動作し、必要な権限が有効であることが必要です。接続や権限が失われると保護が制限されます。回避不可能な保護を保証するものではありません。',
  'details': '詳細な製品・端末ガイド（英語）',
  'access': 'お問い合わせで現在の利用方法をご案内します。',
  'guide': '設定ガイド（英語）',
 },
 'zh': {
  'home': ['为学习留出空间，为家庭留出时间。','Layers 提供课堂工具和家庭设备管理。Guard Family 通过家长控制面板管理 Windows 电脑和 Android 设备；课堂使用 Windows Teacher 和 Student 扩展。','选择适合您的 Layers','Guard Family','家长通过浏览器或 Android Controller 管理。孩子的 Windows 电脑安装 Guard Desktop，Android 设备安装 Guard Mobile，并与家长账户配对。','Layers Classroom','Windows Teacher 提供字幕与语音翻译、计时器、随机点名和屏幕标注。Student 扩展提供词典、朗读、翻译、笔记和课堂连接。','浏览器 Guard','免费 Guard 扩展是独立产品，在浏览器中设置网站限制、浏览时间和页面内容检测。它不连接家庭控制面板。'],
  'guard': ['设备规则，配合家庭的节奏。','将 Windows 和 Android 儿童端与家长账户配对，通过浏览器控制面板或 Android Controller 管理使用时间、应用和网站规则。','在一个地方管理日常规则','时间与计划','设置每日设备限额、单个应用限额、就寝时间，以及工作日和周末计划。儿童端在本地执行已保存的规则。','应用与网站','设置屏蔽列表和允许使用的时段，暂停网络或发送设备锁定指令。新的远程操作需要网络连接。','孩子的申请','孩子可以申请更多时间或应用、网站访问权限，家长可以批准或拒绝。使用记录和内容提醒是辅助信息，检测可能遗漏或误报。','开始前的设置','联系我们获取当前 Windows 或 Android 版本，由家长完成所需权限设置。','在家长控制面板输入儿童端当前显示的配对码。配对码会过期。','检查连接和防护状态，再设置使用时间、就寝时间和限制。在线状态不等于完整防护。'],
  'get': ['获取当前 Layers 应用。','产品组合正在更新。使用旧下载前，请联系我们获取当前版本和设置说明。本站目前不公布价格或购买链接。','选择您需要的工具','Guard Family','通过网页家长控制面板或 Android Controller 管理 Windows 和 Android 儿童端。','Layers Teacher','Windows 课堂工具。当前源代码版本为 v3.18，但旧公开下载不一定包含该版本。','Student 与浏览器 Guard','免费的学习扩展和独立的浏览器防护扩展。请联系我们获取正确扩展的使用方式。','已经有许可证？','在应用或控制面板的提示处输入现有密钥。遇到问题请提供产品、版本和订单号。Windows 的 14 天试用在本地管理，试用结束不会自动收费。'],
  'support': ['Layers 使用与设置帮助','课堂房间连接、浏览器本地防护和家庭设备配对是不同的系统。请先确认您正在使用的产品。','常见问题','设备在线，但防护需要处理','权限和启动状态可能限制防护。请检查控制面板中的防护状态及儿童端诊断。','配对码无法使用','配对码会过期。请使用儿童端当前显示的代码，并使用同一个家长账户配对。','出现意外收费','请提供收据上的商家、日期、产品和订单号，隐藏银行卡等敏感信息。仅凭应用名称无法确定收费来源。','联系表单没有发送','表单只准备邮件草稿。请在邮件应用中发送，或复制到网页邮箱。网站不会直接替您发送邮件。'],
  'soho': ['Layers Talk 是旧版产品。','独立的 Layers Talk 已不属于当前产品组合。开发重点是 Windows Teacher 和适用于 Windows / Android 的 Guard Family。','旧许可证与版本','请联系我们并提供产品名称、版本和订单号。当前 Teacher 的语音翻译针对课堂，与旧版面对面会议翻译的使用方式不同。'],
  'install': ['用房间代码连接课堂','使用 Windows Teacher 与 Chrome / Edge Student 扩展。请联系我们获取正确的当前版本。','课堂设置步骤','获取 Windows Teacher 和 Student 扩展，在教师应用的 Classroom 中创建房间。','学生在支持的网页中打开 Student，输入房间代码。','测试发送链接和求助请求，再根据课堂需要设置 Focus Mode、网站规则和计划。','课堂代码不同于 Guard Family 配对码。课堂限制仅作用于参与的浏览器，不控制整台学生电脑。'],
  'status': '当前应用开发集中于 Windows 和 Android。Mac 应用已停止提供。家长仍可在兼容的 Mac 浏览器中使用网页控制面板。',
  'limits': '防护需要儿童端持续运行并拥有相应权限。连接或权限失效会降低防护能力。我们不保证设备绝对无法绕过限制。',
  'details': '详细产品和设备指南（英语）',
  'access': '请联系我们获取当前使用说明。',
  'guide': '设置指南（英语）',
 },
 'vi': {
  'home': ['Thêm không gian học tập. Thêm thời gian cho gia đình.','Layers gồm công cụ lớp học và quản lý thiết bị gia đình. Guard Family quản lý máy tính Windows và thiết bị Android qua bảng điều khiển phụ huynh. Lớp học dùng Teacher trên Windows và tiện ích Student.','Chọn Layers phù hợp','Guard Family','Phụ huynh quản lý qua trình duyệt hoặc Controller trên Android. Máy Windows của con dùng Guard Desktop; thiết bị Android dùng Guard Mobile và ghép nối với tài khoản phụ huynh.','Layers Classroom','Teacher trên Windows có phụ đề, dịch giọng nói, bộ đếm giờ, chọn học sinh và vẽ trên màn hình. Student có từ điển, đọc văn bản, dịch, ghi chú và kết nối lớp học.','Guard cho trình duyệt','Tiện ích Guard miễn phí là sản phẩm riêng: quy tắc trang web, lịch duyệt web và kiểm tra nội dung được cấu hình trong trình duyệt. Nó không kết nối bảng điều khiển gia đình.'],
  'guard': ['Quy tắc thiết bị theo nhịp sinh hoạt gia đình.','Ghép nối ứng dụng con trên Windows và Android, rồi quản lý thời gian, ứng dụng và trang web từ bảng điều khiển web hoặc Controller trên Android.','Quản lý quy tắc hằng ngày ở một nơi','Thời gian và lịch','Đặt giới hạn mỗi ngày, giới hạn từng ứng dụng, giờ đi ngủ và lịch ngày thường/cuối tuần. Ứng dụng con áp dụng quy tắc đã lưu tại thiết bị.','Ứng dụng và trang web','Quản lý danh sách chặn, khung giờ được dùng, tạm dừng internet hoặc khóa thiết bị. Lệnh từ xa mới cần có kết nối.','Yêu cầu của con','Con có thể xin thêm thời gian hoặc quyền dùng ứng dụng/trang web. Phụ huynh chấp thuận hoặc từ chối. Cảnh báo nội dung là tín hiệu hỗ trợ, có thể bỏ sót hoặc báo nhầm.','Thiết lập trước khi sử dụng','Liên hệ để nhận bản Windows hoặc Android hiện tại. Phụ huynh thực hiện các bước cấp quyền cần thiết.','Nhập mã đang hiển thị trong ứng dụng con vào bảng điều khiển phụ huynh. Mã ghép nối có thời hạn.','Kiểm tra kết nối và trạng thái bảo vệ, rồi đặt giới hạn, giờ đi ngủ và quy tắc. Thiết bị trực tuyến chưa chắc đã được bảo vệ đầy đủ.'],
  'get': ['Nhận ứng dụng Layers hiện tại.','Các sản phẩm đang thay đổi. Hãy liên hệ để nhận bản hiện tại và hướng dẫn thay vì dựa vào liên kết tải cũ. Trang web chưa công bố giá hoặc liên kết thanh toán.','Bạn muốn dùng công cụ nào?','Guard Family','Quản lý ứng dụng con trên Windows và Android bằng bảng điều khiển web hoặc Controller trên Android.','Layers Teacher','Công cụ lớp học dành cho Windows. Mã nguồn hiện tại là v3.18, nhưng bản tải công khai cũ có thể chưa chứa phiên bản này.','Student và Guard trình duyệt','Tiện ích học tập miễn phí và tiện ích bảo vệ trình duyệt riêng biệt. Liên hệ để nhận đúng tiện ích.','Đã có giấy phép?','Nhập khóa hiện có khi ứng dụng hoặc bảng điều khiển yêu cầu. Nếu gặp lỗi, gửi tên sản phẩm, phiên bản và mã đơn hàng. Thử nghiệm 14 ngày trên Windows được tính tại máy và không tự thu phí khi hết hạn.'],
  'support': ['Trợ giúp sử dụng và thiết lập Layers','Phòng lớp học, bảo vệ cục bộ trong trình duyệt và ghép nối thiết bị gia đình là các hệ thống khác nhau. Hãy xác định sản phẩm bạn đang dùng.','Câu hỏi thường gặp','Thiết bị trực tuyến nhưng cần xử lý bảo vệ','Quyền truy cập và trạng thái khởi động có thể làm giảm bảo vệ. Kiểm tra trạng thái trong bảng điều khiển và chẩn đoán trong ứng dụng con.','Mã ghép nối không dùng được','Mã có thời hạn. Dùng mã hiện đang hiển thị trên thiết bị con và cùng tài khoản phụ huynh.','Có khoản thu không mong muốn','Gửi tên đơn vị thu tiền, ngày, sản phẩm và mã đơn hàng trên hóa đơn; che thông tin thanh toán nhạy cảm. Tên ứng dụng chưa đủ để xác định nguồn khoản thu.','Biểu mẫu liên hệ chưa gửi','Biểu mẫu chỉ chuẩn bị bản nháp email. Bạn gửi từ ứng dụng email hoặc sao chép vào webmail. Trang web không gửi email thay bạn.'],
  'soho': ['Layers Talk là sản phẩm cũ.','Ứng dụng Layers Talk riêng biệt không còn trong danh sách sản phẩm hiện tại. Chúng tôi tập trung vào Teacher trên Windows và Guard Family cho Windows / Android.','Giấy phép và bản cũ','Liên hệ với tên sản phẩm, phiên bản và mã đơn hàng. Dịch giọng nói trong Teacher hiện tại phục vụ lớp học và có cách sử dụng khác với công cụ dịch cuộc họp trước đây.'],
  'install': ['Kết nối lớp học bằng mã phòng','Dùng Teacher trên Windows và tiện ích Student trên Chrome / Edge. Liên hệ để nhận đúng bản hiện tại.','Các bước thiết lập lớp học','Nhận Teacher cho Windows và tiện ích Student, rồi tạo phòng trong mục Classroom của ứng dụng giáo viên.','Học sinh mở Student trên trang web được hỗ trợ và nhập mã phòng.','Thử gửi liên kết và yêu cầu trợ giúp, rồi đặt Focus Mode, quy tắc trang web và lịch phù hợp với bài học.','Mã lớp học khác mã ghép nối Guard Family. Quy tắc lớp học chỉ tác động tới trình duyệt tham gia, không điều khiển toàn bộ máy học sinh.'],
  'status': 'Windows và Android là nền tảng ứng dụng hiện tại. Ứng dụng Mac đã ngừng cung cấp. Phụ huynh vẫn có thể mở bảng điều khiển web bằng trình duyệt tương thích trên Mac.',
  'limits': 'Bảo vệ cần ứng dụng con hoạt động và có đủ quyền. Mất kết nối hoặc tắt quyền có thể làm giảm bảo vệ. Layers không bảo đảm rằng thiết bị không thể bị vượt qua giới hạn.',
  'details': 'Hướng dẫn chi tiết về sản phẩm và thiết bị (tiếng Anh)',
  'access': 'Liên hệ để nhận hướng dẫn truy cập hiện tại.',
  'guide': 'Hướng dẫn thiết lập (tiếng Anh)',
 },
}

def build_localized(shell,hero,card,section,notice,button,relationship,nav):
    from html import escape as e
    for lang,d in CONTENT.items():
        primary = button(nav[lang][4],'../contact.html?topic=access',True)
        dash = button(nav[lang][14],'../dashboard.html')
        for filename,key in [('index.html','home'),('guard-pro.html','guard'),('get.html','get'),('support.html','support'),('soho.html','soho'),('layersinstall.html','install')]:
            a=d[key]
            diagram=relationship(lang) if key in ['home','guard'] else None
            content=hero(a[0],a[1], 'Layers' if key=='home' else 'Guard Family' if key=='guard' else '', [primary,dash],diagram=diagram)
            if key in ['home','guard','get','support']:
                routes= ['guard-pro.html','../teacher.html','../guard.html'] if key=='home' else ['guard-pro.html#setup','../guard-desktop.html','../guard-mobile.html'] if key=='guard' else ['guard-pro.html','../teacher.html','../student.html'] if key=='get' else ['../guardinstall.html','../guardinstall.html','../contact.html?topic=payment','../contact.html']
                symbols=['shield','book','screen','globe']
                cards=''.join(card(a[i],a[i+1],href=routes[k],label=d['guide'] if routes[k].startswith('../') else nav[lang][0],symbol=symbols[k]) for k,i in enumerate(range(3,11 if key=='support' else 9,2)))
                content += section(a[2],'<div class="cards">'+cards+'</div>')
                if key=='guard':
                    content += section(a[9],'<div class="cards">'+''.join(card(str(i+1),p,eyebrow=str(i+1).zfill(2)) for i,p in enumerate(a[10:]))+'</div>',id='setup')+notice(d['limits'])
                if key=='get':
                    content += section(a[9],'<div class="prose"><p>'+e(a[10])+'</p></div>')
            elif key=='soho':
                content+=section(a[2],'<div class="prose"><p>'+e(a[3])+'</p></div>')
            else:
                content+=section(a[2],'<div class="prose"><ol>'+''.join('<li>'+e(x)+'</li>' for x in a[3:6])+'</ol><p>'+e(a[6])+'</p></div>')
            content+=notice(d['status'])
            content+='<section class="section"><h2>'+e(d['details'])+'</h2><div class="actions">'+button('Guard Desktop · Windows','../guard-desktop.html')+button('Guard Mobile · Android','../guard-mobile.html')+button('Layers Teacher','../teacher.html')+button('Layers Student','../student.html')+'</div></section>'
            content+='<section class="cta-band"><div><h2>'+e(nav[lang][4])+'</h2><p>'+e(d['access'])+'</p></div>'+primary+'</section>'
            shell(lang+'/'+filename,a[0],a[1],content,lang=lang,noindex=(key=='soho'))
