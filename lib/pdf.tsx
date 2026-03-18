// /**
//  * lib/pdf.tsx
//  *
//  * SEOIQ audit report PDF document.
//  * Uses @react-pdf/renderer — runs server-side only.
//  *
//  * Install: npm install @react-pdf/renderer
//  */

// import {
//   Document,
//   Page,
//   Text,
//   View,
//   StyleSheet,
//   Font,
// } from "@react-pdf/renderer"
// import type { SEOResult } from "@/types/audit"

// // ── Brand tokens (from seoiq-branding-guide) ──────────────────────────────────

// const BRAND = {
//   green: "#0FA968",
//   greenDark: "#087A47",
//   greenMint: "#D1FAE5",
//   charcoal: "#1A1A2E",
//   slateGray: "#64748B",
//   lightGray: "#F1F5F9",
//   borderGray: "#E2E8F0",
//   white: "#FFFFFF",
//   // Score bands
//   excellent: "#0FA968",
//   good: "#EAB308",
//   warning: "#F97316",
//   critical: "#EF4444",
//   // Issue type colors
//   info: "#3B82F6",
// } as const

// // ── Score helpers ──────────────────────────────────────────────────────────────

// function scoreColor(score: number): string {
//   if (score >= 85) return BRAND.excellent
//   if (score >= 70) return BRAND.good
//   if (score >= 40) return BRAND.warning
//   return BRAND.critical
// }

// function scoreLabel(score: number): string {
//   if (score >= 85) return "EXCELLENT"
//   if (score >= 70) return "GOOD"
//   if (score >= 40) return "NEEDS WORK"
//   return "CRITICAL"
// }

// function issueColor(type: string): string {
//   switch (type) {
//     case "critical":
//       return BRAND.critical
//     case "warning":
//       return BRAND.warning
//     case "good":
//       return BRAND.excellent
//     case "info":
//       return BRAND.info
//     default:
//       return BRAND.slateGray
//   }
// }

// function issueLabel(type: string): string {
//   return type.toUpperCase()
// }

// // ── Styles ────────────────────────────────────────────────────────────────────

// const s = StyleSheet.create({
//   // Page
//   page: {
//     backgroundColor: BRAND.white,
//     fontFamily: "Helvetica",
//     paddingTop: 48,
//     paddingBottom: 56,
//     paddingLeft: 48,
//     paddingRight: 48,
//   },

//   // ── Header ──
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 32,
//     paddingBottom: 20,
//     borderBottom: `2px solid ${BRAND.green}`,
//   },
//   headerLeft: {
//     flexDirection: "column",
//   },
//   logoText: {
//     fontSize: 22,
//     fontFamily: "Helvetica-Bold",
//     color: BRAND.charcoal,
//     letterSpacing: 1,
//   },
//   logoAccent: {
//     color: BRAND.green,
//   },
//   tagline: {
//     fontSize: 8,
//     color: BRAND.slateGray,
//     marginTop: 3,
//     letterSpacing: 1,
//   },
//   headerRight: {
//     alignItems: "flex-end",
//   },
//   headerDate: {
//     fontSize: 8,
//     color: BRAND.slateGray,
//   },
//   headerUrl: {
//     fontSize: 9,
//     color: BRAND.green,
//     maxWidth: 240,
//   },

//   // ── Score hero ──
//   scoreHero: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: BRAND.lightGray,
//     borderRadius: 10,
//     padding: 20,
//     marginBottom: 24,
//   },
//   scoreCircleWrap: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 4,
//     flexShrink: 0,
//     marginRight: 24,
//   },
//   scoreNumber: {
//     fontSize: 28,
//     fontFamily: "Helvetica-Bold",
//     lineHeight: 1,
//   },
//   scoreOf: {
//     fontSize: 8,
//     color: BRAND.slateGray,
//     marginTop: 2,
//   },
//   scoreRight: {
//     flex: 1,
//   },
//   scoreBadge: {
//     alignSelf: "flex-start",
//     paddingLeft: 8,
//     paddingRight: 8,
//     paddingTop: 3,
//     paddingBottom: 3,
//     borderRadius: 4,
//   },
//   scoreBadgeText: {
//     fontSize: 8,
//     fontFamily: "Helvetica-Bold",
//     letterSpacing: 1.5,
//     color: BRAND.white,
//   },
//   summaryText: {
//     fontSize: 9.5,
//     color: BRAND.slateGray,
//     lineHeight: 1.65,
//   },

//   // ── Strengths ──
//   strengthsRow: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginTop: 10,
//   },
//   strengthPill: {
//     backgroundColor: BRAND.greenMint,
//     borderRadius: 20,
//     paddingLeft: 8,
//     paddingRight: 8,
//     paddingTop: 3,
//     paddingBottom: 3,
//   },
//   strengthText: {
//     fontSize: 8,
//     color: BRAND.greenDark,
//     fontFamily: "Helvetica-Bold",
//   },

//   // ── Section header ──
//   sectionHeader: {
//     fontSize: 8,
//     fontFamily: "Helvetica-Bold",
//     letterSpacing: 2,
//     color: BRAND.slateGray,
//     marginBottom: 10,
//     marginTop: 20,
//     textTransform: "uppercase",
//   },

//   // ── Category bars ──
//   categoryGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginBottom: 8,
//   },
//   categoryItem: {
//     width: "47%",
//     marginRight: "6%",
//     marginBottom: 8,
//   },
//   categoryRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   categoryLabel: {
//     fontSize: 8.5,
//     color: BRAND.charcoal,
//   },
//   categoryScore: {
//     fontSize: 8.5,
//     fontFamily: "Helvetica-Bold",
//   },
//   barTrack: {
//     height: 4,
//     backgroundColor: BRAND.borderGray,
//     borderRadius: 2,
//     overflow: "hidden",
//   },
//   barFill: {
//     height: 4,
//     borderRadius: 2,
//   },

//   // ── Issue card ──
//   issueCard: {
//     borderRadius: 6,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: BRAND.borderGray,
//   },
//   issueCardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 10,
//   },
//   issueTypeBadge: {
//     paddingLeft: 6,
//     paddingRight: 6,
//     paddingTop: 2,
//     paddingBottom: 2,
//     borderRadius: 3,
//     minWidth: 52,
//     alignItems: "center",
//     flexShrink: 0,
//     marginRight: 10,
//   },
//   issueTypeBadgeText: {
//     fontSize: 7,
//     fontFamily: "Helvetica-Bold",
//     letterSpacing: 1,
//     color: BRAND.white,
//   },
//   issueTitle: {
//     fontSize: 9.5,
//     fontFamily: "Helvetica-Bold",
//     color: BRAND.charcoal,
//     flex: 1,
//   },
//   issueCategoryTag: {
//     fontSize: 7.5,
//     color: BRAND.slateGray,
//   },
//   issueBody: {
//     paddingLeft: 10,
//     paddingRight: 10,
//     paddingBottom: 10,
//   },
//   issueDescription: {
//     fontSize: 8.5,
//     color: BRAND.slateGray,
//     lineHeight: 1.6,
//   },
//   issueFixBox: {
//     backgroundColor: BRAND.lightGray,
//     borderRadius: 4,
//     padding: 8,
//   },
//   issueFixLabel: {
//     fontSize: 7,
//     fontFamily: "Helvetica-Bold",
//     letterSpacing: 1.5,
//     color: BRAND.green,
//   },
//   issueFixText: {
//     fontSize: 8.5,
//     color: BRAND.charcoal,
//     lineHeight: 1.6,
//   },

//   // ── Quick wins ──
//   quickWinRow: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     paddingTop: 8,
//     paddingBottom: 8,
//     borderBottom: `1px solid ${BRAND.borderGray}`,
//   },
//   quickWinNumber: {
//     width: 20,
//     height: 20,
//     borderRadius: 4,
//     backgroundColor: BRAND.green,
//     alignItems: "center",
//     justifyContent: "center",
//     flexShrink: 0,
//     marginRight: 10,
//   },
//   quickWinNumberText: {
//     fontSize: 8,
//     fontFamily: "Helvetica-Bold",
//     color: BRAND.white,
//   },
//   quickWinText: {
//     fontSize: 9,
//     color: BRAND.slateGray,
//     lineHeight: 1.6,
//     flex: 1,
//   },

//   // ── Insights ──
//   insightText: {
//     fontSize: 9.5,
//     color: BRAND.slateGray,
//     lineHeight: 1.75,
//   },

//   // ── Footer ──
//   footer: {
//     position: "absolute",
//     bottom: 24,
//     left: 48,
//     right: 48,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderTop: `1px solid ${BRAND.borderGray}`,
//     paddingTop: 10,
//   },
//   footerLeft: {
//     fontSize: 7.5,
//     color: BRAND.slateGray,
//   },
//   footerRight: {
//     fontSize: 7.5,
//     color: BRAND.slateGray,
//   },

//   // ── Divider ──
//   divider: {
//     height: 1,
//     backgroundColor: BRAND.borderGray,
//     marginTop: 16,
//     marginBottom: 4,
//   },
// })

// // ── Document component ────────────────────────────────────────────────────────

// interface AuditPDFProps {
//   result: SEOResult
//   url: string | null
//   model: string
//   auditDate: string
// }

// export function AuditPDF({ result, url, model, auditDate }: AuditPDFProps) {
//   const color = scoreColor(result.score)
//   const label = scoreLabel(result.score)
//   const issueCount = result.issues?.length ?? 0
//   const criticalCount =
//     result.issues?.filter((i) => i.type === "critical").length ?? 0

//   return (
//     <Document
//       title={`SEOIQ Audit — ${url ?? "Content Analysis"}`}
//       author="SEOIQ"
//       subject="SEO Audit Report"
//       creator="SEOIQ · seoiq.app"
//     >
//       <Page size="A4" style={s.page}>
//         {/* ── Header ── */}
//         <View style={s.header}>
//           <View style={s.headerLeft}>
//             {/* Logo wordmark — SEO in green, IQ in charcoal */}
//             <View style={{ flexDirection: "row" }}>
//               <Text style={[s.logoText, { color: BRAND.green }]}>SEO</Text>
//               <Text style={[s.logoText, { color: BRAND.charcoal }]}>IQ</Text>
//             </View>
//             <Text style={[s.tagline, { marginTop: 4 }]}>
//               AI-POWERED SEO ANALYSIS REPORT
//             </Text>
//           </View>
//           <View style={s.headerRight}>
//             <Text style={[s.headerDate, { marginBottom: 3 }]}>{auditDate}</Text>
//             {url && (
//               <Text style={[s.headerUrl, { marginBottom: 3 }]}>
//                 {url.length > 50 ? url.slice(0, 47) + "…" : url}
//               </Text>
//             )}
//             <Text style={[s.headerDate, { marginTop: 2 }]}>Model: {model}</Text>
//           </View>
//         </View>

//         {/* ── Score hero ── */}
//         <View style={s.scoreHero}>
//           <View style={[s.scoreCircleWrap, { borderColor: color }]}>
//             <Text style={[s.scoreNumber, { color }]}>{result.score}</Text>
//             <Text style={s.scoreOf}>/ 100</Text>
//           </View>
//           <View style={s.scoreRight}>
//             <View
//               style={[
//                 s.scoreBadge,
//                 { backgroundColor: color, marginBottom: 6 },
//               ]}
//             >
//               <Text style={s.scoreBadgeText}>{label}</Text>
//             </View>
//             <Text style={[s.summaryText, { marginBottom: 6 }]}>
//               {result.summary}
//             </Text>
//             {result.topStrengths?.length > 0 && (
//               <View style={s.strengthsRow}>
//                 {result.topStrengths.map((str, i) => (
//                   <View
//                     key={i}
//                     style={[
//                       s.strengthPill,
//                       { marginRight: 5, marginBottom: 4 },
//                     ]}
//                   >
//                     <Text style={s.strengthText}>✓ {str}</Text>
//                   </View>
//                 ))}
//               </View>
//             )}
//           </View>
//         </View>

//         {/* ── Category scores ── */}
//         <Text style={s.sectionHeader}>Category Scores</Text>
//         <View style={s.categoryGrid}>
//           {Object.entries(result.categoryScores ?? {}).map(([cat, sc]) => {
//             const barColor = scoreColor(sc)
//             return (
//               <View key={cat} style={s.categoryItem}>
//                 <View style={[s.categoryRow, { marginBottom: 4 }]}>
//                   <Text style={s.categoryLabel}>{cat}</Text>
//                   <Text style={[s.categoryScore, { color: barColor }]}>
//                     {sc}
//                   </Text>
//                 </View>
//                 <View style={s.barTrack}>
//                   <View
//                     style={[
//                       s.barFill,
//                       { width: `${sc}%`, backgroundColor: barColor },
//                     ]}
//                   />
//                 </View>
//               </View>
//             )
//           })}
//         </View>

//         <View style={s.divider} />

//         {/* ── Issues ── */}
//         <Text style={s.sectionHeader}>
//           Issues ({issueCount} total · {criticalCount} critical)
//         </Text>

//         {result.issues?.map((issue, i) => {
//           const ic = issueColor(issue.type)
//           return (
//             <View key={i} style={s.issueCard} wrap={false}>
//               {/* Row: colored bar | content */}
//               <View style={{ flexDirection: "row" }}>
//                 {/* Left accent bar — separate View avoids border layout shift */}
//                 <View
//                   style={{
//                     width: 4,
//                     backgroundColor: ic,
//                     borderTopLeftRadius: 6,
//                     borderBottomLeftRadius: 6,
//                   }}
//                 />
//                 {/* Card content */}
//                 <View style={{ flex: 1 }}>
//                   {/* Header row: badge | title+category */}
//                   <View
//                     style={{
//                       flexDirection: "row",
//                       alignItems: "center",
//                       padding: 10,
//                     }}
//                   >
//                     <View style={[s.issueTypeBadge, { backgroundColor: ic }]}>
//                       <Text style={s.issueTypeBadgeText}>
//                         {issueLabel(issue.type)}
//                       </Text>
//                     </View>
//                     <View style={{ flex: 1, paddingLeft: 10 }}>
//                       <Text style={s.issueTitle}>{issue.title}</Text>
//                     </View>
//                   </View>
//                   {/* Body: description + fix */}
//                   <View style={s.issueBody}>
//                     <Text
//                       style={[
//                         s.issueDescription,
//                         { marginBottom: issue.fix ? 6 : 0 },
//                       ]}
//                     >
//                       {issue.description}
//                     </Text>
//                     {issue.fix && (
//                       <View style={s.issueFixBox}>
//                         <Text style={[s.issueFixLabel, { marginBottom: 3 }]}>
//                           HOW TO FIX
//                         </Text>
//                         <Text style={s.issueFixText}>{issue.fix}</Text>
//                       </View>
//                     )}
//                   </View>
//                 </View>
//               </View>
//             </View>
//           )
//         })}

//         {/* ── Quick wins ── */}
//         {result.quickWins?.length > 0 && (
//           <>
//             <View style={s.divider} />
//             <Text style={s.sectionHeader}>Quick Wins</Text>
//             {result.quickWins.map((win, i) => (
//               <View
//                 key={i}
//                 style={[
//                   s.quickWinRow,
//                   i === result.quickWins.length - 1
//                     ? { borderBottom: "none" }
//                     : {},
//                 ]}
//               >
//                 <View style={s.quickWinNumber}>
//                   <Text style={s.quickWinNumberText}>{i + 1}</Text>
//                 </View>
//                 <Text style={s.quickWinText}>{win}</Text>
//               </View>
//             ))}
//           </>
//         )}

//         {/* ── Algorithm insights ── */}
//         {result.algorithmInsights && (
//           <>
//             <View style={s.divider} />
//             <Text style={s.sectionHeader}>2024–2025 Algorithm Insights</Text>
//             <Text style={s.insightText}>{result.algorithmInsights}</Text>
//           </>
//         )}

//         {/* ── Footer (fixed position) ── */}
//         <View style={s.footer} fixed>
//           <Text style={s.footerLeft}>SEOIQ · seoiq.app · Confidential</Text>
//           <Text
//             style={s.footerRight}
//             render={({ pageNumber, totalPages }) =>
//               `Page ${pageNumber} of ${totalPages}`
//             }
//           />
//         </View>
//       </Page>
//     </Document>
//   )
// }
