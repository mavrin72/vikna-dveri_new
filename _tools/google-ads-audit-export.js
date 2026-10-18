/**
 * Експорт даних Google Ads для аудиту (лише читання, нічого не змінює).
 *
 * Як запустити:
 *   Google Ads → Інструменти → Масові дії → Скрипти → «+» → вставити цей код
 *   → Авторизувати → «Попередній перегляд» (Preview) або «Запустити».
 * У журналі (Logs) з'явиться посилання на створену Google-таблицю.
 */

var DAYS = 90;

function main() {
  var tz = AdsApp.currentAccount().getTimeZone();
  var end = new Date();
  var start = new Date(end.getTime() - DAYS * 24 * 3600 * 1000);
  var fmt = function (d) { return Utilities.formatDate(d, tz, 'yyyy-MM-dd'); };
  var period = "segments.date BETWEEN '" + fmt(start) + "' AND '" + fmt(end) + "'";

  var ss = SpreadsheetApp.create('Google Ads аудит ' + fmt(end) + ' (' + AdsApp.currentAccount().getName() + ')');

  var M = 'metrics.impressions, metrics.clicks, metrics.ctr, metrics.average_cpc, ' +
          'metrics.cost_micros, metrics.conversions, metrics.all_conversions, metrics.cost_per_conversion';

  var reports = {
    'Кампанії':
      'SELECT campaign.name, campaign.status, campaign.advertising_channel_type, ' +
      'campaign.bidding_strategy_type, campaign_budget.amount_micros, ' +
      'campaign.network_settings.target_search_network, campaign.network_settings.target_content_network, ' +
      'campaign.network_settings.target_partner_search_network, ' +
      'campaign.geo_target_type_setting.positive_geo_target_type, ' +
      'campaign.target_cpa.target_cpa_micros, campaign.maximize_conversions.target_cpa_micros, ' +
      M + ', metrics.search_impression_share, metrics.search_budget_lost_impression_share, ' +
      'metrics.search_rank_lost_impression_share ' +
      'FROM campaign WHERE campaign.status != REMOVED AND ' + period,

    'Пошукові запити':
      'SELECT search_term_view.search_term, search_term_view.status, campaign.name, ad_group.name, ' +
      'segments.keyword.info.text, segments.keyword.info.match_type, ' + M + ' ' +
      'FROM search_term_view WHERE ' + period + ' ORDER BY metrics.cost_micros DESC LIMIT 5000',

    'Ключові слова':
      'SELECT campaign.name, ad_group.name, ad_group_criterion.keyword.text, ' +
      'ad_group_criterion.keyword.match_type, ad_group_criterion.status, ' +
      'ad_group_criterion.system_serving_status, ad_group_criterion.final_urls, ' + M + ' ' +
      'FROM keyword_view WHERE ad_group_criterion.status != REMOVED AND ' + period,

    'Показник якості':
      'SELECT campaign.name, ad_group.name, ad_group_criterion.keyword.text, ' +
      'ad_group_criterion.keyword.match_type, ad_group_criterion.quality_info.quality_score, ' +
      'ad_group_criterion.quality_info.search_predicted_ctr, ' +
      'ad_group_criterion.quality_info.creative_quality_score, ' +
      'ad_group_criterion.quality_info.post_click_quality_score ' +
      'FROM keyword_view WHERE ad_group_criterion.status != REMOVED',

    'Мінус-слова кампаній':
      'SELECT campaign.name, campaign_criterion.keyword.text, campaign_criterion.keyword.match_type ' +
      'FROM campaign_criterion WHERE campaign_criterion.negative = TRUE AND campaign_criterion.type = KEYWORD',

    'Мінус-слова списків':
      'SELECT shared_set.name, shared_criterion.keyword.text, shared_criterion.keyword.match_type ' +
      'FROM shared_criterion WHERE shared_set.type = NEGATIVE_KEYWORDS',

    'Оголошення':
      'SELECT campaign.name, ad_group.name, ad_group_ad.status, ad_group_ad.ad_strength, ' +
      'ad_group_ad.policy_summary.approval_status, ad_group_ad.ad.type, ad_group_ad.ad.final_urls, ' +
      'ad_group_ad.ad.responsive_search_ad.headlines, ad_group_ad.ad.responsive_search_ad.descriptions, ' +
      M + ' FROM ad_group_ad WHERE ad_group_ad.status != REMOVED AND ' + period,

    'Таргетинг локацій':
      'SELECT campaign.name, campaign_criterion.type, campaign_criterion.negative, ' +
      'campaign_criterion.location.geo_target_constant, campaign_criterion.proximity.radius, ' +
      'campaign_criterion.proximity.radius_units, campaign_criterion.proximity.address.city_name, ' +
      'campaign_criterion.bid_modifier ' +
      'FROM campaign_criterion WHERE campaign_criterion.type IN (LOCATION, PROXIMITY)',

    'Звідки кліки (міста)':
      'SELECT campaign.name, segments.geo_target_city, geographic_view.location_type, ' + M + ' ' +
      'FROM geographic_view WHERE ' + period,

    'Пристрої':
      'SELECT campaign.name, segments.device, ' + M + ' FROM campaign WHERE ' + period,

    'Години':
      'SELECT segments.hour_of_day, segments.day_of_week, ' + M + ' FROM customer WHERE ' + period,

    'Дії-конверсії':
      'SELECT conversion_action.name, conversion_action.status, conversion_action.type, ' +
      'conversion_action.category, conversion_action.primary_for_goal, ' +
      'conversion_action.include_in_conversions_metric, conversion_action.counting_type, ' +
      'conversion_action.click_through_lookback_window_days ' +
      'FROM conversion_action WHERE conversion_action.status != REMOVED',

    'Конверсії по діях':
      'SELECT campaign.name, segments.conversion_action_name, metrics.conversions, metrics.all_conversions ' +
      'FROM campaign WHERE ' + period,

    'Розширення (рекламні об\'єкти)':
      'SELECT campaign.name, campaign_asset.field_type, campaign_asset.status, asset.type, asset.name, ' +
      'asset.sitelink_asset.link_text, asset.callout_asset.callout_text, asset.call_asset.phone_number ' +
      'FROM campaign_asset WHERE campaign_asset.status != REMOVED'
  };

  var geoIds = {};
  for (var name in reports) {
    var rows = [];
    try {
      var it = AdsApp.search(reports[name]);
      while (it.hasNext()) {
        var flat = {};
        flatten(it.next(), '', flat);
        if (flat['segments.geoTargetCity']) geoIds[flat['segments.geoTargetCity']] = true;
        if (flat['campaignCriterion.location.geoTargetConstant']) {
          geoIds[flat['campaignCriterion.location.geoTargetConstant']] = true;
        }
        rows.push(flat);
      }
      writeSheet(ss, name, rows);
    } catch (e) {
      writeSheet(ss, name, [{ 'ПОМИЛКА': String(e) }]);
    }
  }

  // Назви міст замість ідентифікаторів geoTargetConstants/123
  var ids = Object.keys(geoIds);
  if (ids.length) {
    var names = [];
    for (var i = 0; i < ids.length; i += 200) {
      var chunk = ids.slice(i, i + 200).map(function (r) { return "'" + r + "'"; }).join(',');
      try {
        var git = AdsApp.search('SELECT geo_target_constant.resource_name, geo_target_constant.canonical_name ' +
                                'FROM geo_target_constant WHERE geo_target_constant.resource_name IN (' + chunk + ')');
        while (git.hasNext()) {
          var g = git.next().geoTargetConstant;
          names.push({ 'id': g.resourceName, 'назва': g.canonicalName });
        }
      } catch (e) {
        names.push({ 'id': 'ПОМИЛКА', 'назва': String(e) });
      }
    }
    writeSheet(ss, 'Довідник локацій', names);
  }

  var first = ss.getSheets()[0];
  if (first.getName() === 'Sheet1' || first.getName() === 'Аркуш1') ss.deleteSheet(first);
  Logger.log('Готово: ' + ss.getUrl());
}

function flatten(obj, prefix, out) {
  for (var k in obj) {
    var v = obj[k];
    var key = prefix ? prefix + '.' + k : k;
    if (Array.isArray(v)) {
      out[key] = v.map(function (x) {
        return x && typeof x === 'object' ? (x.text || JSON.stringify(x)) : x;
      }).join(' | ');
    } else if (v && typeof v === 'object') {
      flatten(v, key, out);
    } else if (/Micros$/.test(k) && v !== null && v !== '') {
      out[key.replace(/Micros$/, '')] = Number(v) / 1e6;
    } else {
      out[key] = v;
    }
  }
}

function writeSheet(ss, name, rows) {
  var sh = ss.insertSheet(name.substring(0, 99));
  if (!rows.length) { sh.getRange(1, 1).setValue('Немає даних'); return; }
  var headers = [];
  rows.forEach(function (r) {
    for (var k in r) if (headers.indexOf(k) < 0) headers.push(k);
  });
  var data = [headers].concat(rows.map(function (r) {
    return headers.map(function (h) { return r[h] === undefined || r[h] === null ? '' : r[h]; });
  }));
  sh.getRange(1, 1, data.length, headers.length).setValues(data);
  sh.setFrozenRows(1);
}
