import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#1a1333",
    color: "#fffbe6",
    padding: 32,
    fontFamily: "Helvetica",
    fontSize: 12,
  },
  cover: {
    backgroundColor: "#3b2066",
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    color: "#ffd700",
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#fffbe6",
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#2d2050",
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#ffd700",
    marginBottom: 8,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: 120,
    color: "#ffd700",
    fontWeight: "bold",
  },
  value: {
    color: "#fffbe6",
  },
  table: {
    marginTop: 8,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid #ffd700",
    marginBottom: 4,
  },
  tableCell: {
    width: 100,
    color: "#ffd700",
    fontWeight: "bold",
  },
  tableCellValue: {
    width: 100,
    color: "#fffbe6",
  },
  list: {
    marginLeft: 16,
    marginTop: 4,
  },
  listItem: {
    marginBottom: 2,
  },
})

export function AstrologyReportPDF({ astroData }: { astroData: any }) {
  if (!astroData) return null
  return (
    <Document>
      {/* Cover Page */}
      <Page style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.title}>Astrology Report</Text>
          <Text style={styles.subtitle}>Your Personalized Horoscope & Key Insights</Text>
          <Text style={{ color: "#ffd700", fontSize: 20, marginTop: 24 }}>{astroData.basic.name}</Text>
          <Text style={{ color: "#fffbe6", fontSize: 14, marginTop: 8 }}>{astroData.basic.birthDate} {astroData.basic.birthTime}</Text>
          <Text style={{ color: "#fffbe6", fontSize: 14 }}>{astroData.basic.birthPlace}</Text>
        </View>

        {/* Basic Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Details</Text>
          <View style={styles.row}><Text style={styles.label}>Sun Sign:</Text><Text style={styles.value}>{astroData.basic.sunSign}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Moon Sign:</Text><Text style={styles.value}>{astroData.basic.moonSign}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Ascendant:</Text><Text style={styles.value}>{astroData.basic.ascendant}</Text></View>
        </View>

        {/* Planetary Positions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planetary Positions</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Planet</Text>
            <Text style={styles.tableCell}>Sign</Text>
            <Text style={styles.tableCell}>Degree</Text>
          </View>
          {astroData.planetaryPositions.map((p: any, i: number) => (
            <View style={styles.row} key={i}>
              <Text style={styles.tableCellValue}>{p.planet}</Text>
              <Text style={styles.tableCellValue}>{p.sign}</Text>
              <Text style={styles.tableCellValue}>{p.degree}</Text>
            </View>
          ))}
        </View>

        {/* Key Points */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Points</Text>
          <View style={styles.list}>
            {astroData.keyPoints.map((kp: any, i: number) => (
              <Text key={i} style={styles.listItem}>• {kp.label}: {kp.value}</Text>
            ))}
          </View>
        </View>

        {/* Predictions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Predictions</Text>
          <View style={styles.list}>
            {astroData.predictions.map((pred: any, i: number) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <Text style={{ color: "#ffd700", fontWeight: "bold" }}>{pred.title}</Text>
                <Text style={styles.value}>{pred.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Remedies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Remedies</Text>
          <View style={styles.list}>
            {astroData.remedies.map((rem: any, i: number) => (
              <Text key={i} style={styles.listItem}>• {rem.title}: {rem.value}</Text>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  )
} 