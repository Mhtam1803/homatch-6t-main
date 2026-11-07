import type { InferredNeed, InferredNeedKey } from "@/types/listing"

const inferenceRules: {
  key: InferredNeedKey
  label: string
  reason: string
  cues: string[]
}[] = [
  {
    key: "quietStudy",
    label: "A quieter home for studying",
    reason: "You mentioned studying or coursework; a quieter environment may help.",
    cues: ["study", "studying", "studies", "homework", "exam", "học", "ôn thi", "làm bài"],
  },
  {
    key: "workFromHome",
    label: "A quiet space for working from home",
    reason: "You mentioned remote work or calls; a quieter home may make that easier.",
    cues: ["remote work", "work from home", "working from home", "online meeting", "video call", "làm việc tại nhà", "họp online", "gọi video"],
  },
  {
    key: "familySpace",
    label: "Extra room for family life",
    reason: "You mentioned children or a baby; extra room may be useful.",
    cues: ["children", "kids", "child", "baby", "newborn", "con nhỏ", "em bé", "có con"],
  },
  {
    key: "easyAccess",
    label: "Easy access, such as an elevator",
    reason: "You mentioned mobility or stairs; elevator access may be helpful.",
    cues: ["elderly", "older parent", "wheelchair", "limited mobility", "difficult stairs", "người lớn tuổi", "ba mẹ", "bố mẹ", "xe lăn", "khó đi cầu thang"],
  },
]

export function inferHiddenNeeds(text: string): InferredNeed[] {
  const normalized = text.toLocaleLowerCase()

  return inferenceRules
    .filter((rule) => rule.cues.some((cue) => normalized.includes(cue)))
    .map(({ key, label, reason }) => ({ key, label, reason }))
}
