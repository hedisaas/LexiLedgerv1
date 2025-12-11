import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { TranslationJob, Quote, BusinessProfile } from '../types';

// Register fonts (using standard fonts for now to ensure compatibility)
// In a real app, you might want to register custom fonts for better styling
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf' }, // Regular
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 'bold' }, // Bold (mock for now)
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#334155', // slate-700
        lineHeight: 1.5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        borderBottomWidth: 2,
        borderBottomColor: '#1e293b', // slate-800
        paddingBottom: 20,
    },
    headerLeft: {
        flexDirection: 'column',
    },
    headerRight: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        textAlign: 'right',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a', // slate-900
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 10,
        color: '#475569', // slate-600
    },
    logo: {
        width: 60,
        height: 60,
        marginBottom: 10,
        objectFit: 'contain',
    },
    businessName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 2,
    },
    translatorName: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 2,
    },
    metaSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    clientSection: {
        width: '50%',
    },
    metaDetails: {
        width: '40%',
        alignItems: 'flex-end',
    },
    sectionLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#94a3b8', // slate-400
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    clientName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 2,
    },
    clientInfo: {
        fontSize: 10,
        color: '#475569',
    },
    metaRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    metaLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#94a3b8',
        textTransform: 'uppercase',
        marginRight: 10,
    },
    metaValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    table: {
        width: '100%',
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9', // slate-100
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0', // slate-200
        padding: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        padding: 8,
    },
    colDesc: { width: '50%' },
    colQty: { width: '15%', textAlign: 'center' },
    colPrice: { width: '15%', textAlign: 'right' },
    colTotal: { width: '20%', textAlign: 'right' },

    tableHeaderText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#0f172a',
        textTransform: 'uppercase',
    },
    cellText: {
        fontSize: 10,
        color: '#334155',
    },
    cellTextBold: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    totalsSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
        marginBottom: 40,
    },
    totalsBox: {
        width: '40%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    totalRowFinal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        marginTop: 4,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 4,
        borderRadius: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    qrCode: {
        width: 60,
        height: 60,
    },
    footerText: {
        fontSize: 8,
        color: '#64748b', // slate-500
        textAlign: 'center',
    },
    validityText: {
        color: '#e11d48', // rose-600
        fontWeight: 'bold',
    }
});

interface InvoicePDFProps {
    data: TranslationJob | Quote;
    type: 'invoice' | 'quote';
    profile: BusinessProfile;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ data, type, profile }) => {
    const isQuote = type === 'quote';
    const title = isQuote ? 'DEVIS' : 'FACTURE';
    const refPrefix = isQuote ? 'DEV' : 'FAC';
    const dateLabel = isQuote ? "Date d'émission" : "Date de facturation";
    const quoteData = isQuote ? (data as Quote) : null;

    // Calculations
    const montantHT = data.priceTotal;
    const tvaRate = 0.19;
    const montantTVA = montantHT * tvaRate;
    const timbreFiscal = type === 'invoice' ? 1.000 : 0;
    const totalTTC = montantHT + montantTVA + timbreFiscal;

    // QR Code (using API for image generation)
    // QR Code (using API for image generation)
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lexiledger.com';
    const qrData = encodeURIComponent(`${baseUrl}/verify/${data.id}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>Traduction Assermentée</Text>
                    </View>
                    <View style={styles.headerRight}>
                        {profile.logo && <Image src={profile.logo} style={styles.logo} />}
                        <Text style={styles.businessName}>{profile.businessName || "LexiLedger Translations"}</Text>
                        <Text style={styles.translatorName}>{profile.translatorName}</Text>
                        <Text>{profile.address || "Adresse non spécifiée"}</Text>
                        <Text>MF: {profile.taxId || "N/A"}</Text>
                        <Text>{profile.phone}</Text>
                        <Text>{profile.email}</Text>
                    </View>
                </View>

                {/* Meta Section */}
                <View style={styles.metaSection}>
                    <View style={styles.clientSection}>
                        <Text style={styles.sectionLabel}>Client:</Text>
                        <Text style={styles.clientName}>{data.clientName}</Text>
                        <Text style={styles.clientInfo}>{data.clientInfo}</Text>
                    </View>
                    <View style={styles.metaDetails}>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Réf {isQuote ? 'Devis' : 'Facture'}:</Text>
                            <Text style={styles.metaValue}>{refPrefix}-{data.id.slice(0, 6).toUpperCase()}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>{dateLabel}:</Text>
                            <Text style={styles.metaValue}>{data.date}</Text>
                        </View>
                        {isQuote && quoteData?.validUntil && (
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Valide jusqu'au:</Text>
                                <Text style={[styles.metaValue, styles.validityText]}>{quoteData.validUntil}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <View style={styles.colDesc}><Text style={styles.tableHeaderText}>Désignation</Text></View>
                        <View style={styles.colQty}><Text style={styles.tableHeaderText}>Qté (Pages)</Text></View>
                        <View style={styles.colPrice}><Text style={styles.tableHeaderText}>Prix Unit. HT</Text></View>
                        <View style={styles.colTotal}><Text style={styles.tableHeaderText}>Total HT</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={styles.colDesc}>
                            <Text style={styles.cellTextBold}>{data.documentType}</Text>
                            <Text style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>
                                Langues: {data.sourceLang} vers {data.targetLang}
                            </Text>
                        </View>
                        <View style={styles.colQty}><Text style={styles.cellText}>{data.pageCount}</Text></View>
                        <View style={styles.colPrice}>
                            <Text style={styles.cellText}>{(data.priceTotal / (data.pageCount || 1)).toFixed(3)}</Text>
                        </View>
                        <View style={styles.colTotal}>
                            <Text style={styles.cellTextBold}>{data.priceTotal.toFixed(3)}</Text>
                        </View>
                    </View>
                </View>

                {/* Totals */}
                <View style={styles.totalsSection}>
                    <View style={styles.totalsBox}>
                        <View style={styles.totalRow}>
                            <Text style={styles.cellText}>Total HT</Text>
                            <Text style={styles.cellText}>{montantHT.toFixed(3)} TND</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.cellText}>TVA (19%)</Text>
                            <Text style={styles.cellText}>{montantTVA.toFixed(3)} TND</Text>
                        </View>
                        {!isQuote && (
                            <View style={styles.totalRow}>
                                <Text style={styles.cellText}>Timbre Fiscal</Text>
                                <Text style={styles.cellText}>{timbreFiscal.toFixed(3)} TND</Text>
                            </View>
                        )}
                        <View style={styles.totalRowFinal}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#0f172a' }}>Total TTC</Text>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#0369a1' }}>{totalTTC.toFixed(3)} TND</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image src={qrUrl} style={styles.qrCode} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' }}>Scan to Verify</Text>
                            <Text style={{ fontSize: 8, color: '#64748b' }}>ID: {data.id.slice(0, 8)}</Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        {profile.rib && <Text style={{ fontSize: 8, color: '#334155', marginBottom: 2 }}>RIB: {profile.rib}</Text>}
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#0f172a' }}>
                            {isQuote ? "Devis valable 30 jours." : "Merci de votre confiance."}
                        </Text>
                    </View>
                </View>

            </Page>
        </Document>
    );
};

export default InvoicePDF;
