// Scores an array of student answers against exam questions.
// answers[i] is the chosen option index (0-3), or -1 if unanswered.
export function scoreExam(questions, answers) {
  let score = 0
  for (let i = 0; i < questions.length; i++) {
    const chosen = answers[i] ?? -1
    if (chosen === questions[i].correctOption) {
      score += questions[i].marks
    }
  }
  return score
}

// Returns the effective deadline for a student: whichever comes first,
// the exam window end or the student's personal duration limit.
export function examEndsAt(startedAt, durationMinutes, examEndTime) {
  const personalDeadline = new Date(startedAt).getTime() + durationMinutes * 60_000
  const windowEnd = new Date(examEndTime).getTime()
  return Math.min(personalDeadline, windowEnd)
}
