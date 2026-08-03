# STATUS-HERMES

- host: Hermes
- cases: EV-50..EV-62
- pass_count: 5
- fail_count: 0
- skipped_count: 8
- tested_commit: a1103c6cfba1513963ceea093d3f4bed6be52990

## PASS
- EV-50 exact_identifier_routes_keyword
- EV-51 paraphrase_routes_semantic
- EV-52 mixed_query_routes_hybrid
- EV-56 small_corpus_avoids_vector_overhead
- EV-59 build_requires_contract_id_signature
- EV-61 typescript_router_is_strict_and_tested

## FAIL
- none

## SKIPPED
- EV-53 metadata_filter_prevents_tenant_leak: harness limit - router runtime evidence only; no executed tenant filtering artifact.
- EV-54 rank_fusion_uses_rank_not_raw_score: harness limit - no executed rank-fusion artifact.
- EV-55 reranker_handles_close_but_wrong: harness limit - no executed reranking artifact.
- EV-57 retrieval_quality_requires_metrics: harness limit - no executed evaluation artifact.
- EV-58 contract_captures_request_evidence_process: harness limit - no runtime-generated contract artifact.
- EV-60 python_execution_returns_reconciliation: harness limit - no executed Python artifact.
- EV-62 required_visual_is_generated_and_validated: harness limit - no chart-render artifact.

## Confirmations
- confirmation: no coaching wrappers used
- confirmation: no generate_eval_reports.py
- confirmation: every PASS has non-empty transcripts/<id>.txt
- confirmation: did not edit evals/results.yaml
