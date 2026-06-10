import {
  DocumentTextIcon,
  MapPinIcon,
  HandRaisedIcon,
  CheckCircleIcon,
  ClockIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import TopNav from '../../components/TopNav'
import BottomNav from '../../components/BottomNav'

interface DocType {
  icon: React.ElementType
  title: string
  description: string
  requirements: string[]
}

const DOCUMENTS: DocType[] = [
  {
    icon: DocumentTextIcon,
    title: 'Barangay Clearance',
    description: 'For employment, business permits, and general identification.',
    requirements: ['Valid ID', 'Residency Fee'],
  },
  {
    icon: MapPinIcon,
    title: 'Certificate of Residency',
    description: 'Official proof of address for banking and government transactions.',
    requirements: ['Proof of Billing', 'Government ID'],
  },
  {
    icon: HandRaisedIcon,
    title: 'Certificate of Indigency',
    description: 'For scholarship applications, medical aid, or social welfare services.',
    requirements: ['Income Proof', 'Case Study'],
  },
]

function DocumentCard({ doc }: { doc: DocType }) {
  const Icon = doc.icon
  return (
    <div className="bg-surface rounded-2xl shadow-card border-l-4 border-accent overflow-hidden">
      <div className="px-5 pt-5 pb-5 space-y-3">
        <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
          <Icon className="w-5 h-5 text-on-primary" />
        </div>
        <div>
          <h3 className="text-[17px] font-bold text-on-surface mb-1">{doc.title}</h3>
          <p className="text-sm text-muted leading-relaxed">{doc.description}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-placeholder mb-2">Requirements</p>
          <ul className="space-y-1.5">
            {doc.requirements.map((req) => (
              <li key={req} className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 shrink-0 text-primary" />
                <span className="text-sm text-on-surface">{req}</span>
              </li>
            ))}
          </ul>
        </div>
        <button type="button" className="w-full bg-accent text-on-primary font-semibold text-sm rounded-lg py-3.5 hover:opacity-90 active:opacity-80 transition-opacity mt-1">
          Request
        </button>
      </div>
    </div>
  )
}

export default function RequestDocumentPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:pl-64">
      <TopNav title="Document Requests" />

      <div className="flex-1 px-5 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
        <div className="mb-2">
          <h2 className="text-[22px] font-bold text-on-surface mb-1">Available Documents</h2>
          <p className="text-sm text-muted leading-relaxed">
            Select a document to start your request process. Ensure you have the required files ready.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {DOCUMENTS.map((doc) => <DocumentCard key={doc.title} doc={doc} />)}
        </div>

        {/* My Requests */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[20px] font-bold text-on-surface">My Requests</h2>
            <button type="button" className="text-sm text-muted hover:text-on-surface transition-colors">View All</button>
          </div>

          <div className="bg-surface rounded-2xl shadow-card border-l-4 border-accent px-4 py-4 space-y-3 mb-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-low flex items-center justify-center shrink-0">
                <DocumentTextIcon className="w-5 h-5 text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-surface">Barangay Clearance</p>
                <p className="text-xs text-muted mt-0.5">Request ID: #ISMSI-10293 • Applied Oct 24, 2023</p>
              </div>
            </div>
            <span className="inline-block text-[11px] font-bold text-on-primary bg-primary px-3 py-1.5 rounded-full">
              Ready for Pickup
            </span>
            <button type="button" className="flex items-center gap-2 border border-outline rounded-lg px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-low transition-colors">
              <ArrowDownTrayIcon className="w-4 h-4" />
              Download Receipt
            </button>
          </div>

          <div className="border-2 border-dashed border-divider rounded-2xl px-6 py-8 flex flex-col items-center justify-center gap-2 text-center">
            <ClockIcon className="w-8 h-8 text-divider" />
            <p className="text-sm text-placeholder max-w-[200px] leading-relaxed">
              Older requests will appear here once processed.
            </p>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-primary rounded-2xl px-4 py-4 flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-on-primary/60 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-on-primary mb-1">Processing Notice</p>
            <p className="text-xs text-on-primary/70 leading-relaxed">
              Most document requests are processed within 24-48 business hours. You will receive a notification once your document is ready for collection or digital download.
            </p>
          </div>
        </div>
        </div>
      </div>

      <BottomNav active="requests" />
    </div>
  )
}
