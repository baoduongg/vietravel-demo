/**
 * Phân loại cảm xúc, phong cách du lịch và không khí (Vibe & Emotion Taxonomy)
 * Dùng để làm giàu dữ liệu ngữ nghĩa và hỗ trợ tìm kiếm theo cảm xúc cho các tour Vietravel.
 */

export interface VibeCategory {
  id: string
  name: string
  keywords: string[]
  destinations: string[]
  description: string
}

export const VIBE_CATEGORIES: VibeCategory[] = [
  {
    id: "healing_peace",
    name: "Chữa lành & Yên bình (Healing & Peaceful)",
    keywords: [
      "chữa lành", "yên bình", "thư giãn", "xả stress", "tĩnh lặng", "bình yên", "trốn phố",
      "thư thái", "an yên", "reset bản thân", "thiền", "nghỉ ngơi", "không ồn ào", "tươi mát"
    ],
    destinations: ["Đà Lạt", "Yên Tử", "Ninh Bình", "Tràng An", "Hà Giang", "Pù Luông", "Côn Đảo", "Huế", "Mai Châu", "Mộc Châu", "Sapa", "Ba Bể"],
    description: "Không gian thoáng đãng, gần gũi thiên nhiên, thanh tịnh để phục hồi năng lượng tinh thần."
  },
  {
    id: "romantic_honeymoon",
    name: "Lãng mạn & Trăng mật (Romantic & Couple)",
    keywords: [
      "lãng mạn", "trăng mật", "honeymoon", "cặp đôi", "ngọt ngào", "tình nhân", "kỷ niệm ngày cưới",
      "hẹn hò", "hoàng hôn", "ấm cúng", "sang trọng"
    ],
    destinations: ["Đà Lạt", "Phú Quốc", "Bà Nà Hills", "Hội An", "Nha Trang", "Paris", "Venice", "Maldives", "Jeju", "Santorini", "Đà Nẵng"],
    description: "Cảnh quan thơ mộng, bầu không khí ngọt ngào, dịch vụ cao cấp dành riêng cho các cặp đôi."
  },
  {
    id: "mist_mountain_cool",
    name: "Se lạnh & Săn mây (Cool & Mountain Mist)",
    keywords: [
      "se lạnh", "lạnh", "săn mây", "sương mù", "núi rừng", "đồi thông", "núi cao", "đỉnh núi",
      "không khí trong lành", "mùa đông", "áo ấm", "cao nguyên"
    ],
    destinations: ["Sapa", "Fansipan", "Đà Lạt", "Hà Giang", "Mộc Châu", "Bà Nà", "Tây Bắc", "Bảo Lộc", "Bạch Mộc Lương Tử", "Tam Đảo"],
    description: "Khí hậu mát mẻ quanh năm, se se lạnh, biển mây bồng bềnh và núi non hùng vĩ."
  },
  {
    id: "beach_sunshine",
    name: "Biển xanh & Nắng vàng (Tropical Beach)",
    keywords: [
      "biển", "biển xanh", "nắng vàng", "tắm biển", "hải sản", "lặn ngắm san hô", "đảo",
      "resort", "nghỉ dưỡng biển", "nhiệt đới", "sóng biển", "bờ cát"
    ],
    destinations: ["Phú Quốc", "Nha Trang", "Quy Nhơn", "Phan Thiết", "Mũi Né", "Đà Nẵng", "Côn Đảo", "Vũng Tàu", "Phuket", "Bali", "Pattaya"],
    description: "Bãi cát trắng trải dài, nước biển trong xanh, hải sản tươi ngon và các hoạt động thể thao biển."
  },
  {
    id: "culture_heritage",
    name: "Văn hoá & Di sản (Heritage & Culture)",
    keywords: [
      "văn hoá", "lịch sử", "di sản", "cổ kính", "phố cổ", "truyền thống", "bảo tàng", "di tích",
      "kiến trúc xưa", "hoài niệm", "lăng tẩm", "cố đô", "làng nghề"
    ],
    destinations: ["Hội An", "Huế", "Hà Nội", "Ninh Bình", "Côn Đảo", "Đền Hùng", "Angkor Wat", "Kyoto", "Bắc Kinh", "Xiêm Riệp", "Luang Prabang"],
    description: "Khám phá các giá trị lịch sử lâu đời, kiến trúc cổ xưa và nét đẹp văn hóa độc đáo."
  },
  {
    id: "spiritual_pilgrimage",
    name: "Tâm linh & Chiêm bái (Spiritual & Pilgrimage)",
    keywords: [
      "tâm linh", "chùa chiền", "chiêm bái", "cầu an", "cầu phúc", "đền đài", "thánh địa",
      "hành hương", "linh thiêng", "tượng phật", "chùa bái đính", "yên tử"
    ],
    destinations: ["Yên Tử", "Bái Đính", "Chùa Hương", "Tây Thiên", "Côn Đảo", "Chùa Tam Chúc", "Chùa Bà Tây Ninh", "Chùa Vàng", "Ấn Độ", "Tây Tạng", "Myanmar"],
    description: "Hành trình viếng thăm các chốn linh thiêng để tìm kiếm sự bình an trong tâm hồn."
  },
  {
    id: "modern_shopping_checkin",
    name: "Hiện đại & Sống ảo (Modern, Shopping & Check-in)",
    keywords: [
      "sống ảo", "check-in", "hiện đại", "mua sắm", "shopping", "sôi động", "nhộn nhịp",
      "thành phố lớn", "trung tâm thương mại", "ẩm thực đường phố", "vui chơi giải trí", "công viên chủ đề"
    ],
    destinations: ["Bangkok", "Singapore", "Tokyo", "Seoul", "Thượng Hải", "Hồng Kông", "Dubai", "Kuala Lumpur", "Bà Nà Hills", "VinWonders"],
    description: "Những điểm check-in rực rỡ, thiên đường mua sắm sầm uất và các tổ hợp vui chơi giải trí hàng đầu."
  },
  {
    id: "family_cruise_relax",
    name: "Gia đình & Du thuyền (Family & Cruise Relax)",
    keywords: [
      "gia đình", "người lớn tuổi", "trẻ nhỏ", "nhẹ nhàng", "du thuyền", "tiện nghi",
      "không leo trèo", "nghỉ dưỡng", "trọn gói", "cao cấp", "ẩm thực phong phú"
    ],
    destinations: ["Hạ Long", "Lan Hạ", "Đà Nẵng", "Phú Quốc", "Nha Trang", "Singapore Cruise", "Bangkok"],
    description: "Lịch trình thong thả, di chuyển thuận tiện, phù hợp cho cả người cao tuổi và các em nhỏ."
  },
  {
    id: "autumn_foliage_snow",
    name: "Mùa thu lá đỏ & Tuyết trắng (Autumn & Winter Wonder)",
    keywords: [
      "mùa thu", "lá vàng", "lá đỏ", "ngắm tuyết", "tuyết trắng", "mùa đông", "hoa tam giác mạch",
      "mùa lúa chín", "cảnh sắc bốn mùa", "rực rỡ"
    ],
    destinations: ["Hà Giang", "Mù Cang Chải", "Hàn Quốc", "Nhật Bản", "Châu Âu", "Bắc Kinh", "Cửu Trại Câu", "Sapa", "Trương Gia Giới"],
    description: "Chiêm ngưỡng những cảnh tượng thiên nhiên kỳ diệu theo mùa: mùa vàng lúa chín, lá phong rực rỡ hay tuyết phủ trắng xoá."
  }
]
