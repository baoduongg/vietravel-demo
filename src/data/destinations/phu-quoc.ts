import type { DestinationGuide } from "@/types/destination"

const IMG = "https://s3-cmc.travel.com.vn/vtv-image/Images/Destination/"

/** Nội dung soạn tay cho bản demo; cần nhân viên Vietravel kiểm duyệt trước khi dùng thật. */
export const phuQuoc: DestinationGuide = {
  slug: "phu-quoc",
  name: "Phú Quốc",
  tagline: "Đảo ngọc của những hoàng hôn khiến bạn không muốn rời mắt",
  intro:
    "Cát trắng Bãi Sao, nước biển xanh ngọc, cáp treo vượt biển, chợ đêm rộn ràng và hải sản tươi rói. Chỉ khoảng một giờ bay từ TP. Hồ Chí Minh, Phú Quốc đủ để ba ngày nghỉ ngơi thật sự trọn vẹn.",
  heroImageUrl: `${IMG}tf__0_6221_bai-sao-1.webp`,
  coordinates: { lat: 10.22, lon: 103.96 },
  tourKeyword: "phú quốc",
  reasons: [
    { title: "Biển xanh, cát trắng", text: "Bãi Sao, Bãi Dài, Bãi Khem: nước trong, sóng êm vào mùa khô." },
    { title: "Hoàng hôn đẹp bậc nhất", text: "Bãi Trường, Thị trấn Hoàng Hôn và Dinh Cậu là những điểm ngắm mặt trời lặn được yêu thích." },
    { title: "Vui chơi cả ngày lẫn đêm", text: "VinWonders, Safari, Grand World, cáp treo Hòn Thơm và chợ đêm sôi động." },
    { title: "Bay rất nhanh", text: "Khoảng 1 giờ từ TP. Hồ Chí Minh, có chuyến bay thẳng từ Hà Nội, Đà Nẵng và Cần Thơ." },
    { title: "Hải sản và đặc sản", text: "Gỏi cá trích, ghẹ Hàm Ninh, nhum nướng, nước mắm và rượu sim mang về làm quà." },
  ],
  months: [
    { label: "T1", score: 5, tempC: "24–31°C", rain: "Rất ít mưa", advice: "Trời xanh, biển lặng, đúng thời điểm đẹp nhất. Mùa cao điểm nên đặt vé và phòng sớm." },
    { label: "T2", score: 5, tempC: "24–32°C", rain: "Rất ít mưa", advice: "Nắng ráo, hợp tắm biển và lặn ngắm san hô. Dịp Tết rất đông khách." },
    { label: "T3", score: 5, tempC: "25–33°C", rain: "Ít mưa", advice: "Nắng đẹp, hơi nóng buổi trưa. Nên đi biển sáng sớm và chiều muộn." },
    { label: "T4", score: 4, tempC: "26–33°C", rain: "Mưa thưa", advice: "Nóng nhất năm, cuối tháng có thể có mưa rào. Biển vẫn đẹp, giá bắt đầu mềm hơn." },
    { label: "T5", score: 3, tempC: "26–32°C", rain: "Mưa rào chiều", advice: "Vào mùa mưa: thường mưa rào ngắn buổi chiều, sáng vẫn nắng. Giá tốt." },
    { label: "T6", score: 2, tempC: "25–31°C", rain: "Mưa nhiều", advice: "Mưa thường xuyên, biển có thể đục. Hợp người thích yên tĩnh và ưu tiên giá rẻ." },
    { label: "T7", score: 2, tempC: "25–31°C", rain: "Mưa nhiều", advice: "Mưa nhiều, vắng khách. Nên chọn lịch trình linh hoạt, có phương án trong nhà." },
    { label: "T8", score: 2, tempC: "25–31°C", rain: "Mưa nhiều", advice: "Mưa rào xen nắng. Phòng và vé bay thường rẻ, các điểm vui chơi ít đông." },
    { label: "T9", score: 2, tempC: "25–31°C", rain: "Mưa nhiều", advice: "Mưa và dông thường vào chiều tối. Hoạt động trên biển có thể dời lịch." },
    { label: "T10", score: 2, tempC: "25–31°C", rain: "Mưa nhiều", advice: "Mưa dông thường vào chiều tối, sáng vẫn có nắng và mưa giảm dần về cuối tháng. Giá còn mềm; chọn tour có lịch trình linh hoạt." },
    { label: "T11", score: 4, tempC: "25–32°C", rain: "Mưa giảm dần", advice: "Mưa thưa dần, biển đẹp lên rõ rệt. Nên đặt sớm cho dịp cuối năm." },
    { label: "T12", score: 5, tempC: "24–31°C", rain: "Ít mưa", advice: "Mùa khô vào đủ, thời tiết mát. Đông khách dịp Noel và năm mới." },
  ],
  routes: [
    { from: "TP. Hồ Chí Minh", mode: "Bay thẳng", duration: "khoảng 1 giờ", note: "Nhiều chuyến mỗi ngày, lựa chọn phổ biến nhất." },
    { from: "Hà Nội", mode: "Bay thẳng", duration: "khoảng 2 giờ 10 phút", note: "Nhiều chuyến mỗi ngày." },
    { from: "Đà Nẵng", mode: "Bay thẳng", duration: "khoảng 1 giờ 45 phút", note: "Số chuyến ít hơn, nên kiểm tra lịch bay trước khi đặt." },
    { from: "Cần Thơ", mode: "Bay thẳng", duration: "khoảng 50 phút", note: "Tiện cho khách miền Tây." },
    { from: "Hà Tiên", mode: "Tàu cao tốc", duration: "khoảng 1 giờ 15 phút", note: "Chặng biển ngắn nhất ra đảo." },
    { from: "Rạch Giá", mode: "Tàu cao tốc", duration: "khoảng 2 giờ 30 phút", note: "Phù hợp khách đi từ miền Tây, có thể gửi xe. Kiểm tra lịch tàu trước khi đi." },
  ],
  onIsland: [
    { name: "Taxi, xe công nghệ", note: "Có ở sân bay và khu Dương Đông, nên hỏi giá trước khi lên xe." },
    { name: "Thuê xe 4–7 chỗ có tài xế", note: "Tiện cho gia đình, đi Bắc đảo và Nam đảo trong một ngày." },
    { name: "Thuê xe máy", note: "Linh hoạt nếu quen đường. Cần bằng lái và đội mũ bảo hiểm." },
    { name: "Xe đưa đón của resort, khu vui chơi", note: "Nhiều nơi có xe đưa đón theo giờ, nên hỏi khi đặt phòng." },
  ],
  airport: {
    photo: { src: "/images/phu-quoc/san-bay-phu-quoc.webp", alt: "Nhà ga Sân bay quốc tế Phú Quốc với núi phía sau", caption: "Sân bay quốc tế Phú Quốc", credit: { author: "Tonbi ko", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Phu_Quoc_International_Airport.JPG" } },
    facts: [
      { label: "Sân bay", value: "Quốc tế Phú Quốc (PQC)" },
      { label: "Tới Dương Đông", value: "Khoảng 10 km, 15–20 phút đi xe" },
      { label: "Bay từ TP.HCM", value: "Khoảng 1 giờ" },
    ],
  },
  travelTips: [
    "Mang CCCD hoặc hộ chiếu còn hạn, cần cho cả chuyến bay lẫn tàu cao tốc.",
    "Tàu cao tốc: đến bến sớm, kiểm tra lịch tàu vì biển động có thể làm dời giờ chạy.",
    "Dịp lễ, Tết và cuối năm: đặt vé bay, tàu và phòng sớm để có giá và giờ đẹp.",
  ],
  onIslandPhoto: { src: "/images/phu-quoc/di-chuyen-xe-may.webp", alt: "Người đi xe máy trên đường ở Phú Quốc", caption: "Xe máy là cách di chuyển quen thuộc trên đảo", credit: { author: "Avenue", license: "CC BY-SA 3.0", url: "https://commons.wikimedia.org/wiki/File:Female_motorcyclist_wearing_gloves,_Ph%C3%BA_Qu%E1%BB%91c,_Vietnam.jpg" } },
  areas: [
    { name: "Dương Đông", blurb: "Trung tâm đảo: chợ đêm, quán ăn, thuê xe thuận tiện." },
    { name: "Bãi Trường (Tây đảo)", blurb: "Dải biển dài với nhiều resort, ngắm hoàng hôn ngay trước hiên." },
    { name: "Nam đảo (An Thới, Bãi Sao)", blurb: "Thị trấn Hoàng Hôn, Bãi Sao, cáp treo Hòn Thơm và lặn san hô." },
    { name: "Bắc đảo (Bãi Dài)", blurb: "Yên tĩnh hơn, gần VinWonders, Safari và Grand World." },
  ],
  videos: [
    { id: "pAUO1qBD4-g", title: "Phú Quốc 2025 qua flycam 4K", channel: "Neo Scenic Films" },
    { id: "hbQTZK_tWyI", title: "Thị trấn Hoàng Hôn về đêm", channel: "Wild Ether" },
  ],
  gallery: [
    { src: "/images/phu-quoc/bai-bien-ghe-dai-duong.webp", alt: "Hai ghế nằm dưới ô trên bãi cát trắng nhìn ra biển Phú Quốc", caption: "Bãi cát trắng, ghế nằm và biển xanh", credit: { author: "Quangpraha", license: "CC0", url: "https://commons.wikimedia.org/wiki/File:Phuquoc-3058734.jpg" } },
    { src: "/images/phu-quoc/kiss-of-the-sea.webp", alt: "Màn trình diễn pháo hoa Kiss of the Sea về đêm ở Thị trấn Hoàng Hôn", caption: "Kiss of the Sea về đêm ở Thị trấn Hoàng Hôn", credit: { author: "Vivu Vietnam", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Kiss_of_the_Sea_fireworks_show_Sunset_Town_Sun_World_Phu_Quoc_night_Vietnam.jpg" } },
    { src: "/images/phu-quoc/bai-sao.webp", alt: "Bãi Sao với cát trắng mịn và nước biển trong", caption: "Bãi Sao, cát mịn nước trong", credit: { author: "Vnecofriendly", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Star_Beach_(B%C3%A3i_Sao).jpg" } },
    { src: "/images/phu-quoc/cap-treo-an-thoi.webp", alt: "Nhìn xuống làng chài An Thới từ cáp treo Hòn Thơm", caption: "An Thới nhìn từ cáp treo Hòn Thơm", credit: { author: "Pauloleong2002", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:View_from_cable_car_at_Phu_Quoc_Island.jpg" } },
    { src: "/images/phu-quoc/bai-bien-cay-dua.webp", alt: "Bãi biển hàng dừa nhìn từ trên cao ở Phú Quốc", caption: "Bãi biển hàng dừa nhìn từ trên cao", credit: { author: "dronepicr", license: "CC BY 2.0", url: "https://commons.wikimedia.org/wiki/File:Amazing_beach_on_Phu_Quoc_island_Vietnam_(38647607275).jpg" } },
    { src: "/images/phu-quoc/kiss-bridge.webp", alt: "Du khách xem pháo hoa trên Kiss Bridge", caption: "Pháo hoa trên Kiss Bridge", credit: { author: "Vivu Vietnam", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Kiss_Bridge_during_fireworks.jpg" } },
  ],
  stays: [
    { name: "Resort ven biển Bãi Trường", tag: "Cao cấp · Tây đảo", blurb: "Bãi biển riêng, hồ bơi lớn, đủ tiện ích cho kỳ nghỉ chỉ ở resort.", audiences: ["family", "couple"], tip: "Chọn phòng hướng biển để ngắm hoàng hôn.", imageUrl: "/images/phu-quoc/stay-resort-ven-bien.webp", credit: { author: "Elmschrat", license: "CC0", url: "https://commons.wikimedia.org/wiki/File:1_Phu_Quoc_beach_Saigon_Phu_Quoc_Resort_and_Spa.jpg" } },
    { name: "Resort liền kề khu vui chơi", tag: "Cao cấp · Bắc đảo", blurb: "Gần VinWonders và Safari, có câu lạc bộ trẻ em, tiện cho gia đình có con nhỏ.", audiences: ["family", "friends"], imageUrl: "/images/phu-quoc/stay-resort-bac-dao.webp", credit: { author: "dronepicr", license: "CC BY 2.0", url: "https://commons.wikimedia.org/wiki/File:Beautiful_beach_on_Phu_Quoc_island_Vietnam_(39543775721).jpg" } },
    { name: "Villa hồ bơi riêng", tag: "Cao cấp · Tây và Nam đảo", blurb: "Không gian riêng tư, bữa sáng tại villa, hợp kỳ nghỉ kỷ niệm.", audiences: ["couple", "friends"], imageUrl: "/images/phu-quoc/stay-villa-hoang-hon.webp", credit: { author: "Elmschrat", license: "CC0", url: "https://commons.wikimedia.org/wiki/File:1_Phu_Quoc_sunset.jpg" } },
    { name: "Khách sạn trung tâm Dương Đông", tag: "Tầm trung", blurb: "Đi bộ tới chợ đêm và quán ăn, thuê xe dễ, giá dễ chịu.", audiences: ["couple", "friends"], imageUrl: "/images/phu-quoc/stay-duong-dong.webp", credit: { author: "Tonbi ko", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Night_market_in_Phu_Quoc.jpg" } },
    { name: "Khách sạn gia đình, phòng liên thông", tag: "Tầm trung", blurb: "Phòng rộng, có phòng liên thông và bữa sáng cho trẻ em.", audiences: ["family"], imageUrl: "/images/phu-quoc/stay-gia-dinh.webp", credit: { author: "Elmschrat", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Phu_Quoc_beach_01.jpg" } },
    { name: "Khách sạn, homestay gần biển", tag: "Tiết kiệm", blurb: "Giá tốt, đi bộ ra biển. Hợp nhóm bạn trẻ ưu tiên đi nhiều hơn ở.", audiences: ["friends", "couple"], imageUrl: "/images/phu-quoc/stay-homestay-gan-bien.webp", credit: { author: "Tonbi ko", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Beach_near_Ham_Ninh_Phu_Quoc.JPG" } },
  ],
  dishes: [
    { name: "Gỏi cá trích", blurb: "Cá trích tươi trộn dừa nạo, cuốn bánh tráng cùng rau rừng, chấm mắm tương.", where: "Quán địa phương ở Dương Đông", price: "Khoảng 100.000–200.000đ một đĩa", bestTime: "Bữa trưa hoặc tối", imageUrl: "/images/phu-quoc/mon-goi-ca-trich.webp", credit: { author: "OlBoes", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:G%E1%BB%8Fi_C%C3%A1_Tr%C3%ADch.jpg" } },
    { name: "Bún quậy", blurb: "Tô bún tự pha nước chấm theo khẩu vị với tôm, cá thác lác, nước lèo thanh ngọt.", where: "Dương Đông", price: "Khoảng 40.000–70.000đ một tô", bestTime: "Bữa sáng hoặc trưa" },
    { name: "Ghẹ Hàm Ninh", blurb: "Ghẹ thịt chắc ngọt, hấp tại làng chài ngay khi vừa lên bờ.", where: "Làng chài Hàm Ninh", price: "Tính theo ký, hỏi giá trước khi gọi", bestTime: "Buổi chiều, khi ghe vừa về bờ", imageUrl: "/images/phu-quoc/mon-ghe-ham-ninh.webp", credit: { author: "trungydang", license: "CC BY 3.0", url: "https://commons.wikimedia.org/wiki/File:Ch%E1%BB%A3_H%C3%A0m_Ninh-_Ph%C3%BA_Qu%E1%BB%91c,_Ki%C3%AAn_Giang_-_panoramio.jpg" } },
    { name: "Nhum nướng mỡ hành", blurb: "Nhum biển nướng nóng, béo ngậy, ăn kèm bánh tráng nướng.", where: "Chợ đêm và quán hải sản ven biển", price: "Tính theo con hoặc phần, hỏi giá trước", bestTime: "Buổi tối ở chợ đêm", imageUrl: "/images/phu-quoc/mon-nhum-nuong.webp", credit: { author: "Ekaterina Kvelidze", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Sea_urchin_Vietnam.jpg" } },
    { name: "Bún kèn", blurb: "Món bún nước lèo cá và nước cốt dừa đậm đà, ăn sáng rất hợp.", where: "Quán nhỏ trong khu dân cư", price: "Khoảng 40.000–60.000đ một tô", bestTime: "Bữa sáng" },
    { name: "Đặc sản mang về", blurb: "Nước mắm, rượu sim, ngọc trai, tiêu: quà biếu quen thuộc của Phú Quốc.", where: "Chợ Dương Đông, cửa hàng đặc sản", price: "Tùy loại, nên so sánh vài cửa hàng", bestTime: "Mua ngày cuối chuyến", imageUrl: "/images/phu-quoc/mon-nuoc-mam.webp", credit: { author: "Stefan from Dresden, Germany", license: "CC BY 2.0", url: "https://commons.wikimedia.org/wiki/File:Fish_sauce_factory,_Phu_Quoc.jpg" } },
  ],
  foodPhoto: { src: "/images/phu-quoc/cho-dem-hai-san.webp", alt: "Các bể hải sản sống bày bán ở chợ đêm Phú Quốc", caption: "Hải sản sống ở chợ đêm Dương Đông", credit: { author: "FrogsLegs71", license: "CC BY-SA 3.0", url: "https://commons.wikimedia.org/wiki/File:Live_seafood_for_sale_in_Phu_Quoc_night_market_Vietnam.jpg" } },
  eatTips: [
    "Hải sản tính theo ký: hỏi giá niêm yết và cân tại chỗ trước khi gọi.",
    "Hỏi luôn phí chế biến và món ăn kèm để tránh phát sinh khi thanh toán.",
    "Muốn ăn rẻ và đúng vị địa phương, thử các quán nhỏ khu dân cư hoặc chợ Hàm Ninh.",
  ],
  activities: [
    { name: "Cáp treo vượt biển và Hòn Thơm", tag: "Nam đảo", blurb: "Ngồi cabin lướt trên biển ngắm các hòn đảo nhỏ, rồi xuống Hòn Thơm với công viên nước, bãi biển và trò chơi.", audiences: ["family", "couple", "friends"], imageUrl: `${IMG}tf__0_12482_sun-world-hon-thom-4.webp`, tip: "Đi buổi sáng để tránh nắng và hàng chờ." },
    { name: "Thị trấn Hoàng Hôn và Kiss Bridge", tag: "Nam đảo", blurb: "Khu phố ven biển kiểu châu Âu, cây cầu Kiss Bridge để đón hoàng hôn và xem show buổi tối.", audiences: ["couple", "friends", "family"], imageUrl: `${IMG}tf__0_6130_dji0785.webp`, tip: "Có mặt trước hoàng hôn khoảng một giờ để chọn chỗ đẹp." },
    { name: "VinWonders Phú Quốc", tag: "Bắc đảo", blurb: "Công viên chủ đề với trò chơi cảm giác mạnh, công viên nước và show diễn buổi tối.", audiences: ["family", "friends"], imageUrl: `${IMG}tf__2_13564_vinwonders.webp` },
    { name: "Vinpearl Safari", tag: "Bắc đảo", blurb: "Vườn thú bán hoang dã: đi xe tham quan, cho thú ăn, rất hợp trẻ nhỏ.", audiences: ["family", "couple", "friends"] },
    { name: "Grand World", tag: "Bắc đảo", blurb: "Khu phố sôi động về đêm với kênh đào, thuyền gondola, show diễn và ẩm thực.", audiences: ["couple", "friends", "family"], imageUrl: `${IMG}tf__1_13918_grand-world-1.webp` },
    { name: "Bãi Sao", tag: "Nam đảo", blurb: "Bãi cát trắng mịn, nước trong, hợp tắm biển và chụp ảnh. Có dịch vụ ghế dù và quán ăn nhẹ.", audiences: ["family", "couple", "friends"], imageUrl: `${IMG}tf__0_6221_bai-sao-1.webp` },
    { name: "Lặn ngắm san hô và câu mực đêm", tag: "Biển đảo", blurb: "Đi ca nô ra các hòn đảo nhỏ lặn ống thở ngắm san hô; buổi tối đi câu mực trên biển.", audiences: ["friends", "couple"], tip: "Mùa mưa biển có thể động, chuyến thường được dời lịch." },
    { name: "Dinh Cậu và Thiền viện Trúc Lâm Hộ Quốc", tag: "Dương Đông · Nam đảo", blurb: "Điểm tâm linh nhìn ra biển, nhẹ nhàng, phù hợp người lớn tuổi.", audiences: ["family", "couple"] },
    { name: "Chợ đêm Phú Quốc", tag: "Dương Đông", blurb: "Hải sản nướng, đặc sản và quà lưu niệm trong một buổi tối dạo phố.", audiences: ["family", "couple", "friends"], tip: "Hỏi giá hải sản trước khi gọi món." },
  ],
  itinerary: [
    {
      day: 1,
      title: "Đến đảo, hoàng hôn Bãi Trường",
      items: [
        { time: "Sáng", text: "Bay đến Phú Quốc, nhận phòng hoặc gửi hành lý." },
        { time: "Trưa", text: "Ăn bún quậy hoặc gỏi cá trích ở Dương Đông." },
        { time: "Chiều", text: "Ghé Dinh Cậu, ra Bãi Trường tắm biển và đón hoàng hôn." },
        { time: "Tối", text: "Dạo chợ đêm, thử nhum nướng và hải sản." },
      ],
    },
    {
      day: 2,
      title: "Nam đảo: biển, cáp treo, Thị trấn Hoàng Hôn",
      items: [
        { time: "Sáng", text: "Đi cáp treo vượt biển sang Hòn Thơm, tắm biển và chơi công viên nước." },
        { time: "Trưa", text: "Ăn trưa tại Hòn Thơm hoặc Bãi Sao." },
        { time: "Chiều", text: "Ghé Bãi Sao, sau đó đến Thị trấn Hoàng Hôn và Kiss Bridge." },
        { time: "Tối", text: "Ngắm hoàng hôn, xem show tại Kiss Bridge (theo lịch từng ngày)." },
      ],
    },
    {
      day: 3,
      title: "Bắc đảo và mua đặc sản",
      items: [
        { time: "Sáng", text: "Chọn một: VinWonders hoặc Vinpearl Safari (hợp gia đình có trẻ nhỏ)." },
        { time: "Trưa", text: "Ăn trưa, nghỉ ngơi." },
        { time: "Chiều", text: "Mua nước mắm, rượu sim, ngọc trai làm quà, ra sân bay." },
      ],
    },
  ],
  costs: [
    { label: "Vé máy bay khứ hồi", range: "1,5 – 3,5 triệu đồng/người" },
    { label: "Lưu trú 2 đêm", range: "1,2 – 6 triệu đồng/phòng, tùy hạng" },
    { label: "Ăn uống", range: "300 – 600 nghìn đồng/người/ngày" },
    { label: "Vé tham quan, vui chơi", range: "vài trăm nghìn đến hơn 1 triệu đồng/điểm" },
    { label: "Di chuyển trên đảo", range: "200 – 500 nghìn đồng/ngày" },
  ],
  packing: [
    "Kem chống nắng, mũ, kính râm",
    "Đồ bơi, áo choàng, dép đi biển",
    "Áo mưa gọn nhẹ (mùa mưa từ tháng 5 đến tháng 10)",
    "Túi chống nước cho điện thoại, sạc dự phòng",
    "Thuốc say sóng nếu đi tàu hoặc ca nô",
    "CCCD hoặc hộ chiếu để làm thủ tục bay",
  ],
  reviews: [
    { nick: "Minh Anh", trip: "Gia đình 4 người · Tháng 8/2026", rating: 5, text: "Con mình mê Safari và công viên nước Hòn Thơm. Đặt tour trọn gói nên không phải lo xe đưa đón, cả nhà đi rất nhẹ nhàng." },
    { nick: "Thu H.", trip: "Cặp đôi · Tháng 3/2026", rating: 5, text: "Hoàng hôn ở Kiss Bridge đẹp hơn ảnh. Nên đến sớm một tiếng để có chỗ đứng đẹp." },
    { nick: "Quân", trip: "Nhóm bạn 6 người · Tháng 6/2026", rating: 4, text: "Hôm mưa phải dời lịch lặn san hô sang hôm sau nhưng hướng dẫn viên xử lý rất linh hoạt. Hải sản chợ đêm ngon, nhớ hỏi giá trước." },
    { nick: "Cô Lan", trip: "Đi cùng ba mẹ · Tháng 1/2026", rating: 5, text: "Ba mẹ lớn tuổi đi cáp treo rất êm, không mệt. Có xe đón tận nơi nên cả nhà yên tâm." },
    { nick: "Hải Đăng", trip: "Đi một mình · Tháng 9/2026", rating: 4, text: "Mùa mưa vắng khách, vé bay và phòng đều rẻ. Sáng nắng đẹp, chiều có mưa rào ngắn. Ai không ngại thời tiết thì nên đi." },
  ],
  faqs: [
    { question: "Mùa nào đi Phú Quốc đẹp nhất?", answer: "Từ tháng 11 đến tháng 4 là mùa khô: trời xanh, biển lặng, nhưng đông khách và giá cao. Tháng 5 đến tháng 10 là mùa mưa: vắng khách, giá mềm hơn, mưa thường theo từng đợt, nhiều vào chiều tối." },
    { question: "Đi Phú Quốc mấy ngày là đủ?", answer: "3 ngày 2 đêm đủ để đi Nam đảo, Bắc đảo và thưởng thức đặc sản. Nếu muốn thong thả, thêm lặn ngắm san hô hoặc nghỉ resort, nên đi 4 ngày 3 đêm." },
    { question: "Giấy tờ cần mang khi đi Phú Quốc?", answer: "Khách Việt Nam mang CCCD hoặc giấy tờ tùy thân hợp lệ khi bay nội địa; khách nước ngoài mang hộ chiếu. Quý khách nên xác nhận lại với hãng bay trước ngày đi." },
    { question: "Mang nước mắm Phú Quốc lên máy bay thế nào?", answer: "Mỗi hãng bay có quy định riêng về nước mắm và chất lỏng, một số hãng chỉ nhận loại đóng gói sẵn đạt chuẩn. Quý khách nên mua loại đóng gói sẵn dành cho đi máy bay tại cửa hàng hoặc sân bay, và kiểm tra quy định hành lý của hãng bay trước khi đi." },
    { question: "Người lớn tuổi đi cáp treo Hòn Thơm có phù hợp không?", answer: "Cabin di chuyển êm nên phù hợp với nhiều người lớn tuổi. Nếu có bệnh nền, Quý khách nên báo trước cho tư vấn viên để chọn lịch trình phù hợp." },
    { question: "Nên đặt tour trọn gói hay đi tự túc?", answer: "Tour trọn gói gồm vé bay, khách sạn, xe và tham quan, tiện cho gia đình và nhóm đông. Đi tự túc linh hoạt hơn. Vietravel có cả tour lẫn dịch vụ lẻ như khách sạn và vé máy bay để Quý khách tự chọn." },
  ],
  serviceGuides: {
    flight: {
      intro: "Phú Quốc có sân bay quốc tế, bay thẳng từ TP.HCM, Hà Nội, Đà Nẵng, Cần Thơ. Đặt sớm 3–4 tuần thường có giá tốt hơn.",
      tips: [
        "Mùa khô (tháng 11–4) và các dịp lễ vé tăng nhanh, nên đặt trước 1–2 tháng.",
        "Chuyến sáng sớm thường ít trễ hơn chuyến chiều tối mùa mưa.",
        "Kiểm tra quy định hành lý ký gửi nếu định mang nước mắm, hải sản khô về.",
        "Sân bay cách Dương Đông khoảng 15 phút xe, có thể đặt đưa đón trước.",
      ],
      faqs: [
        { question: "Bay từ TP.HCM đến Phú Quốc mất bao lâu?", answer: "Khoảng 1 giờ bay. Từ Hà Nội khoảng 2 giờ 10 phút." },
        { question: "Trẻ em đi máy bay tính giá thế nào?", answer: "Thường trẻ dưới 2 tuổi tính giá em bé, từ 2 đến dưới 12 tuổi tính giá trẻ em. Mức cụ thể tùy hãng bay, Quý khách xem giá khi thêm vào kế hoạch." },
      ],
    },
    hotel: {
      intro: "Từ homestay gần biển đến villa hồ bơi riêng. Chọn khu Dương Đông nếu thích phố đêm, Bãi Trường để ngắm hoàng hôn, Bắc đảo nếu đi VinWonders.",
      tips: [
        "Gia đình có trẻ nhỏ nên chọn resort có hồ bơi nông và câu lạc bộ trẻ em.",
        "Ở Nam đảo thuận đi cáp treo Hòn Thơm, ở Bắc đảo thuận Safari và VinWonders.",
        "Mùa mưa nhiều resort giảm giá sâu, đáng cân nhắc nếu không ngại mưa chiều.",
      ],
      faqs: [
        { question: "Nên ở khu nào tại Phú Quốc?", answer: "Lần đầu đến, Dương Đông hoặc Bãi Trường tiện đi lại và ăn uống. Muốn yên tĩnh, nghỉ dưỡng thì chọn Nam đảo hoặc Bắc đảo." },
        { question: "Giá phòng đã gồm bữa sáng chưa?", answer: "Tùy cơ sở. Giá trên trang là giá tham khảo mỗi phòng mỗi đêm, Quý khách xem mô tả từng nơi." },
      ],
    },
    vehicle: {
      intro: "Đảo rộng, các điểm cách nhau 20–40 km. Thuê xe máy để tự do, hoặc ô tô có tài xế cho gia đình và nhóm đông.",
      tips: [
        "Thuê xe máy cần bằng lái, luôn đội mũ bảo hiểm.",
        "Ô tô 7 chỗ hợp gia đình có trẻ nhỏ, có thể yêu cầu ghế trẻ em.",
        "Đặt đưa đón sân bay trước để không phải chờ xe khi hạ cánh.",
      ],
      faqs: [
        { question: "Có taxi hay xe công nghệ ở Phú Quốc không?", answer: "Có, chủ yếu quanh Dương Đông và sân bay. Đi Nam đảo, Bắc đảo cả ngày thì thuê xe theo ngày thường tiện và rẻ hơn." },
      ],
    },
    activity: {
      intro: "Cáp treo Hòn Thơm, Safari, VinWonders, lặn ngắm san hô, chợ đêm. Nhiều bãi biển đẹp miễn phí.",
      tips: [
        "Lặn ngắm san hô đẹp nhất mùa khô khi biển lặng.",
        "Cáp treo Hòn Thơm nên đi buổi sáng, chiều thường đông.",
        "Hoàng hôn đẹp ở Sunset Town và Bãi Trường, đến sớm 1 tiếng.",
      ],
      faqs: [
        { question: "Trẻ em có được giảm giá vé vui chơi không?", answer: "Phần lớn điểm vui chơi có giá trẻ em theo chiều cao hoặc độ tuổi. Kế hoạch tự tính theo tuổi các bé Quý khách nhập." },
      ],
    },
    dining: {
      intro: "Hải sản tươi, gỏi cá trích, bún quậy, ghẹ Hàm Ninh. Từ quán địa phương đến nhà hàng view biển.",
      tips: [
        "Ở chợ đêm, hỏi giá theo ký trước khi gọi món hải sản.",
        "Làng chài Hàm Ninh nổi tiếng ghẹ, nên đi buổi trưa.",
        "Nhà hàng view biển nên đặt bàn trước giờ hoàng hôn.",
      ],
      faqs: [
        { question: "Ăn hải sản ở Phú Quốc khoảng bao nhiêu tiền?", answer: "Quán bình dân khoảng 200–400 nghìn mỗi người, nhà hàng view biển từ 500 nghìn trở lên mỗi người." },
      ],
    },
    souvenir: {
      intro: "Nước mắm, hồ tiêu, ngọc trai, rượu sim, khô cá: đặc sản Phú Quốc từ các thương hiệu địa phương.",
      tips: [
        "Mua nước mắm loại đóng gói dành cho đi máy bay.",
        "Ngọc trai nên mua ở cơ sở có giấy kiểm định.",
        "Hồ tiêu và khô cá mua tại vườn, chợ địa phương thường tươi và rẻ hơn.",
      ],
      faqs: [
        { question: "Mang nước mắm lên máy bay được không?", answer: "Tùy hãng bay, nhiều hãng chỉ nhận loại đóng gói chuyên dụng. Quý khách kiểm tra quy định hành lý trước khi mua." },
      ],
    },
    tour: {
      intro: "Tour trọn gói Vietravel gồm vé bay, khách sạn, xe và tham quan, khởi hành từ nhiều thành phố.",
      tips: [
        "Tour trọn gói tiện cho gia đình và nhóm đông, không phải lo xe và lịch trình.",
        "So giá tour với tự túc bằng cách thêm cả hai vào một kế hoạch.",
        "Ngày khởi hành và giá lấy trực tiếp từ travel.com.vn.",
      ],
      faqs: [
        { question: "Giá tour đã gồm vé máy bay chưa?", answer: "Đa số tour Phú Quốc của Vietravel đã gồm vé máy bay khứ hồi. Quý khách xem chi tiết trên trang tour." },
      ],
    },
  },
  links: {
    hotels: "https://travel.com.vn/khach-san-phu-quoc",
    flights: "https://travel.com.vn/ve-may-bay",
    tours: "https://travel.com.vn/du-lich-phu-quoc",
  },
}
