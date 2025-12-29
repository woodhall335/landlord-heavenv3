import { createAdminClient } from '@/lib/supabase/server';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import {
  mapCaseFactsToMoneyClaimCase,
  mapCaseFactsToScotlandMoneyClaimCase,
} from '@/lib/documents/money-claim-wizard-mapper';

interface FulfillOrderInput {
  orderId: string;
  caseId: string;
  productType: string;
  userId?: string | null;
}

export async function fulfillOrder({ orderId, caseId, productType, userId }: FulfillOrderInput) {
  const supabase = createAdminClient();

  const { data: existingDocs } = await supabase
    .from('documents')
    .select('id')
    .eq('case_id', caseId)
    .eq('is_preview', false)
    .limit(1);

  if (existingDocs && existingDocs.length > 0) {
    await supabase
      .from('orders')
      .update({
        fulfillment_status: 'fulfilled',
        fulfilled_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    return { status: 'already_fulfilled', documents: existingDocs.length };
  }

  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .single();

  if (caseError || !caseData) {
    throw new Error('Case not found for fulfillment');
  }

  const resolvedUserId = userId || (caseData as any).user_id;
  if (!resolvedUserId) {
    throw new Error('Unable to resolve user for fulfillment');
  }

  const wizardFacts = (caseData as any).collected_facts || {};
  const caseFacts = wizardFactsToCaseFacts(wizardFacts as any);

  if (productType === 'notice_only' || productType === 'complete_pack') {
    const { generateNoticeOnlyPack, generateCompleteEvictionPack } = await import(
      '@/lib/documents/eviction-pack-generator'
    );

    const evictionPack =
      productType === 'notice_only'
        ? await generateNoticeOnlyPack(wizardFacts)
        : await generateCompleteEvictionPack(wizardFacts);

    for (const doc of evictionPack.documents) {
      if (!doc.pdf) continue;

      const fileName = `${resolvedUserId}/${caseId}/${doc.file_name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, doc.pdf, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      await supabase.from('documents').insert({
        user_id: resolvedUserId,
        case_id: caseId,
        document_type: doc.category,
        document_title: doc.title,
        jurisdiction: (caseData as any).jurisdiction,
        html_content: doc.html || null,
        pdf_url: publicUrlData.publicUrl,
        is_preview: false,
        qa_passed: true,
        metadata: { description: doc.description, pack_type: productType, order_id: orderId },
      });
    }

    await supabase
      .from('orders')
      .update({
        fulfillment_status: 'fulfilled',
        fulfilled_at: new Date().toISOString(),
        metadata: {
          total_documents: evictionPack.documents.length,
          pack_type: evictionPack.pack_type,
          jurisdiction: evictionPack.jurisdiction,
        },
      })
      .eq('id', orderId);

    return { status: 'fulfilled', documents: evictionPack.documents.length };
  }

  if (productType === 'money_claim') {
    const { generateMoneyClaimPack } = await import('@/lib/documents/money-claim-pack-generator');

    const pack = await generateMoneyClaimPack({
      ...mapCaseFactsToMoneyClaimCase(caseFacts),
      case_id: caseId,
    });

    for (const doc of pack.documents) {
      if (!doc.pdf) continue;

      const fileName = `${resolvedUserId}/${caseId}/${doc.file_name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, doc.pdf, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      await supabase.from('documents').insert({
        user_id: resolvedUserId,
        case_id: caseId,
        document_type: doc.category,
        document_title: doc.title,
        jurisdiction: (caseData as any).jurisdiction,
        html_content: doc.html || null,
        pdf_url: publicUrlData.publicUrl,
        is_preview: false,
        qa_passed: true,
        metadata: { description: doc.description, pack_type: productType, order_id: orderId },
      });
    }

    await supabase
      .from('orders')
      .update({
        fulfillment_status: 'fulfilled',
        fulfilled_at: new Date().toISOString(),
        metadata: {
          total_documents: pack.documents.length,
          pack_type: pack.pack_type,
          jurisdiction: pack.jurisdiction,
        },
      })
      .eq('id', orderId);

    return { status: 'fulfilled', documents: pack.documents.length };
  }

  if (productType === 'sc_money_claim') {
    const { generateScotlandMoneyClaim } = await import(
      '@/lib/documents/scotland-money-claim-pack-generator'
    );

    const pack = await generateScotlandMoneyClaim({
      ...mapCaseFactsToScotlandMoneyClaimCase(caseFacts),
      case_id: caseId,
    });

    for (const doc of pack.documents) {
      if (!doc.pdf) continue;

      const fileName = `${resolvedUserId}/${caseId}/${doc.file_name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, doc.pdf, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      await supabase.from('documents').insert({
        user_id: resolvedUserId,
        case_id: caseId,
        document_type: doc.category,
        document_title: doc.title,
        jurisdiction: (caseData as any).jurisdiction,
        html_content: doc.html || null,
        pdf_url: publicUrlData.publicUrl,
        is_preview: false,
        qa_passed: true,
        metadata: { description: doc.description, pack_type: productType, order_id: orderId },
      });
    }

    await supabase
      .from('orders')
      .update({
        fulfillment_status: 'fulfilled',
        fulfilled_at: new Date().toISOString(),
        metadata: {
          total_documents: pack.documents.length,
          pack_type: pack.pack_type,
          jurisdiction: pack.jurisdiction,
        },
      })
      .eq('id', orderId);

    return { status: 'fulfilled', documents: pack.documents.length };
  }

  const { generateStandardAST, generatePremiumAST } = await import('@/lib/documents/ast-generator');

  let generatedDoc: any;
  let documentTitle = '';
  let documentType = '';

  switch (productType) {
    case 'ast_standard':
      generatedDoc = await generateStandardAST(wizardFacts);
      documentTitle = 'Assured Shorthold Tenancy Agreement - Standard';
      documentType = 'ast_standard';
      break;
    case 'ast_premium':
      generatedDoc = await generatePremiumAST(wizardFacts);
      documentTitle = 'Assured Shorthold Tenancy Agreement - Premium';
      documentType = 'ast_premium';
      break;
    default:
      throw new Error(`Unsupported product type for fulfillment: ${productType}`);
  }

  let pdfUrl: string | null = null;
  if (generatedDoc?.pdf) {
    const fileName = `${resolvedUserId}/${caseId}/${documentType}_final_${Date.now()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, generatedDoc.pdf, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);
    pdfUrl = publicUrlData.publicUrl;
  }

  await supabase
    .from('documents')
    .insert({
      user_id: resolvedUserId,
      case_id: caseId,
      document_type: documentType,
      document_title: documentTitle,
      jurisdiction: (caseData as any).jurisdiction,
      html_content: generatedDoc?.html || null,
      pdf_url: pdfUrl,
      is_preview: false,
      qa_passed: false,
      qa_score: null,
      qa_issues: [],
      metadata: { order_id: orderId },
    })
    .select()
    .single();

  await supabase
    .from('orders')
    .update({
      fulfillment_status: 'fulfilled',
      fulfilled_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  return { status: 'fulfilled', documents: 1 };
}
