import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#171717",
  },
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#F8F8FC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  score: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#171717",
  },
  riskLevel: {
    fontSize: 14,
    color: "#5169FE",
  },
  documentMeta: {
    borderTopWidth: 1,
    borderColor: "#e5e5e5",
    paddingTop: 10,
  },
  filename: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#171717",
  },
  date: {
    color: "#666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#5169FE",
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 1.5,
    color: "#171717",
  },
  disclaimer: {
    marginTop: 30,
    padding: 10,
    backgroundColor: "#F8F8FC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  disclaimerText: {
    fontSize: 10,
    color: "#666",
    fontStyle: "italic",
  },
});

interface Report {
  score: number;
  risk_level: string;
  analysis_results: string;
  filename: string;
  created_at: string;
}

interface ReportPDFProps {
  report: Report;
  disclaimer: string;
}

export const ReportPDF = ({ report, disclaimer }: ReportPDFProps) => {
  const formatAnalysisContent = (content: string) => {
    return content
      .replace(/[=Ê,<¯]/g, "") // Remove special characters
      .replace(/🔍|📋|[*]/g, "") // Remove emojis and asterisks
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => {
        // Clean up section headers
        if (line.includes("EXECUTIVE SUMMARY")) {
          return "EXECUTIVE SUMMARY";
        }
        if (line.includes("DETAILED ANALYSIS")) {
          return "DETAILED ANALYSIS";
        }
        if (line.includes("FINAL VERDICT")) {
          return "FINAL VERDICT";
        }
        return line;
      });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Analysis Report</Text>

          <View style={styles.scoreContainer}>
            <Text style={styles.score}>{report.score}/100</Text>
            <Text style={styles.riskLevel}>
              {report.risk_level.toUpperCase()} RISK
            </Text>
          </View>

          <View style={styles.documentMeta}>
            <Text style={styles.filename}>{report.filename}</Text>
            <Text style={styles.date}>
              {new Date(report.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXECUTIVE SUMMARY</Text>
          {formatAnalysisContent(report.analysis_results).map((line, i) => (
            <Text key={i} style={styles.paragraph}>
              {line}
            </Text>
          ))}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>{disclaimer}</Text>
        </View>
      </Page>
    </Document>
  );
};
