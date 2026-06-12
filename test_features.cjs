const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 3001;

function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: API_HOST,
      port: API_PORT,
      path: '/api' + path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve({ error: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('\n🚀 开始端到端测试\n');

  // 1. 登录 ShadowMaster
  console.log('=== 1. 登录 ShadowMaster ===');
  let res = await request('/auth/login', { method: 'POST' }, { username: 'ShadowMaster', password: 'password' });
  console.log('  登录:', res.success ? '✅ 成功' : '❌ 失败');
  const token = res.data?.token;
  if (!token) { console.log('  错误:', res.error); process.exit(1); }
  const auth = { headers: { Authorization: 'Bearer ' + token } };

  // 2. 市场列表
  console.log('\n=== 2. 市场列表 ===');
  res = await request('/market/listings', auth);
  console.log('  商品数:', res.data?.length || 0);
  const listing = res.data?.[0];

  // 3. 成交记录
  console.log('\n=== 3. 成交记录 ===');
  res = await request('/market/histories', auth);
  console.log('  记录数:', res.data?.length || 0);

  // 4. 价格走势
  console.log('\n=== 4. 价格走势 ===');
  res = await request('/market/price-trends', auth);
  (res.data || []).forEach(t => {
    console.log(`  ${t.rarity}: 均价${Math.round(t.average)} 成交量${t.volume}`);
  });

  // 5. 我的交易
  console.log('\n=== 5. 我的交易 ===');
  res = await request('/market/my-trades', auth);
  console.log('  交易数:', res.data?.length || 0);

  // 6. 卷轴库存
  console.log('\n=== 6. 卷轴库存 ===');
  res = await request('/market/scrolls', auth);
  console.log('  卷轴数:', res.data?.length || 0);
  const scroll = res.data?.[0];

  // 7. 间谍列表
  console.log('\n=== 7. 间谍列表 ===');
  res = await request('/spies', auth);
  console.log('  间谍数:', res.data?.length || 0);
  const spy = res.data?.[0];
  if (spy) {
    console.log(`  ${spy.codeName}: 状态${spy.status} 装备卷轴${spy.equippedScrolls?.length || 0}`);
  }

  // 8. 任务列表
  console.log('\n=== 8. 任务列表及奖励 ===');
  res = await request('/missions', auth);
  const mission = res.data?.[0];
  if (mission) {
    console.log(`  ${mission.title}`);
    console.log(`    积分奖励: ${mission.rewards.intelPoints}`);
    console.log(`    声望奖励: ${mission.rewards.reputation}`);
    console.log(`    卷轴奖励: ${mission.rewards.scrolls.join(', ')}`);
  }

  // 9. 公会列表
  console.log('\n=== 9. 公会列表 ===');
  res = await request('/guild/list', auth);
  console.log('  公会数:', res.data?.length || 0);
  (res.data || []).forEach(g => {
    console.log(`  - ${g.name}: ${g.members?.length || 0}成员`);
  });

  // 10. 我的公会
  console.log('\n=== 10. 我的公会 ===');
  res = await request('/guild', auth);
  console.log('  我的公会:', res.data?.name || '无');

  // 11. 测试装备卷轴（先卸下再装备）
  let listingScrollId = null;
  let sellerSpyId = null;
  let createdListing = null;
  if (spy && scroll) {
    console.log('\n=== 11. 卷轴装备/卸下测试 ===');
    const scrollEquipped = spy.equippedScrolls.includes(scroll.id);
    if (scrollEquipped) {
      res = await request('/spies/unequip-scroll', { ...auth, method: 'POST' }, {
        spyId: spy.id, scrollId: scroll.id
      });
      console.log('  卸下:', res.success ? '✅ 成功' : '❌ 失败 ' + (res.error || ''));
    }
    res = await request('/spies/equip-scroll', { ...auth, method: 'POST' }, {
      spyId: spy.id, scrollId: scroll.id
    });
    console.log('  装备:', res.success ? '✅ 成功' : '❌ 失败 ' + (res.error || ''));
    if (res.success) {
      console.log('  装备后卷轴数:', res.data?.equippedScrolls?.length);
    }

    // 11.5 装备卷轴后自动上架测试
    console.log('\n=== 11.5 装备卷轴后自动上架测试 ===');
    listingScrollId = scroll.id;
    sellerSpyId = spy.id;
    console.log('  装备卷轴ID:', listingScrollId, '到间谍:', sellerSpyId);

    res = await request('/market/listings', { ...auth, method: 'POST' }, {
      itemId: listingScrollId,
      price: 500
    });
    console.log('  创建上架:', res.success ? '✅ 成功' : '❌ 失败 ' + (res.error || ''));
    if (res.success) {
      createdListing = res.data;
      console.log('  上架商品ID:', createdListing?.id);
    }

    console.log('  获取间谍详情验证自动卸下...');
    res = await request(`/spies/${sellerSpyId}`, auth);
    const spyAfterListing = res.data;
    const stillEquipped = spyAfterListing?.equippedScrolls?.includes(listingScrollId);
    console.log('  间谍仍装备该卷轴:', stillEquipped ? '❌ 是（应该自动卸下）' : '✅ 否（已自动卸下）');
  }

  // 12. 测试购买默认商品（优先使用新创建的上架商品）
  const listingToBuy = createdListing || listing;
  if (listingToBuy) {
    // 用第二个账号测试购买
    console.log('\n=== 12. 注册测试账号 ===');
    const rand = Math.floor(Math.random() * 99999);
    res = await request('/auth/register', { method: 'POST' }, {
      username: 'TestBuyer' + rand,
      email: 'test' + rand + '@test.com',
      password: 'testpass123'
    });
    console.log('  注册:', res.success ? '✅ 成功' : '❌ 失败 ' + (res.error || ''));
    const token2 = res.data?.token;
    if (token2) {
      const auth2 = { headers: { Authorization: 'Bearer ' + token2 } };
      
      console.log('\n=== 13. 创建买家组织 ===');
      res = await request('/organization', { ...auth2, method: 'POST' }, {
        name: '测试买家组织', codeName: 'Tester', baseLocation: '测试'
      });
      console.log('  创建:', res.success ? '✅ 成功' : '❌ 失败 ' + (res.error || ''));

      if (res.success) {
        console.log('\n=== 14. 购买商品 ===');
        res = await request(`/market/listings/${listingToBuy.id}/buy`, { ...auth2, method: 'POST' });
        console.log('  购买:', res.success ? '✅ 成功' : '❌ 失败 ' + (res.error || ''));

        if (res.success) {
          console.log('  买后买家积分:', res.data?.buyerPoints);
          console.log('  卖后卖家积分:', res.data?.sellerPoints);
        }

        console.log('\n=== 15. 验证买家库存 ===');
        res = await request('/market/scrolls', auth2);
        const buyerScrollCount = res.data?.length || 0;
        const buyerScrolls = res.data || [];
        console.log('  买家卷轴数:', buyerScrollCount, buyerScrollCount > 5 ? '✅ 增加了' : '');

        console.log('\n=== 16. 验证成交记录 ===');
        res = await request('/market/histories', auth);
        console.log('  成交记录数:', res.data?.length || 0, (res.data?.length || 0) > 0 ? '✅ 有记录' : '');

        // 16.5 验证卖家间谍已卸下
        if (sellerSpyId && listingScrollId) {
          console.log('\n=== 16.5 验证卖家间谍已卸下 ===');
          res = await request('/spies', auth);
          const sellerSpies = res.data || [];
          const targetSpy = sellerSpies.find(s => s.id === sellerSpyId);
          if (targetSpy) {
            const stillHasScroll = targetSpy.equippedScrolls?.includes(listingScrollId);
            console.log('  卖家间谍仍装备该卷轴:', stillHasScroll ? '❌ 是' : '✅ 否（已卸下）');
          } else {
            console.log('  未找到目标间谍');
          }

          const buyerHasScroll = buyerScrolls.some(s => s.id === listingScrollId || s.id === listingToBuy.itemId);
          console.log('  买家库存包含该卷轴:', buyerHasScroll ? '✅ 是' : '❌ 否');
        }

        console.log('\n=== 17. 验证价格走势变化 ===');
        res = await request('/market/price-trends', auth);
        const changed = (res.data || []).find(t => t.volume > 0);
        if (changed) {
          console.log(`  ${changed.rarity}: 均价${Math.round(changed.average)} 成交量${changed.volume} ✅`);
        }

        console.log('\n=== 18. 验证最新公告 ===');
        res = await request('/reports/announcements', auth);
        const lastAnn = res.data?.[0];
        console.log('  最新公告:', lastAnn?.message || '无', (lastAnn?.message || '').includes('购买') ? '✅ 有成交公告' : '');
      }
    }
  }

  // 19. 公会建筑 & 贡献排行
  console.log('\n=== 19. 公会建筑详情 ===');
  res = await request('/guild', auth);
  if (res.data && res.data.buildings) {
    res.data.buildings.forEach(b => {
      console.log(`  - ${b.name} Lv.${b.level}/${b.maxLevel} 奖励+${b.bonus}%`);
    });
  }
  const gid = res.data?.id;
  if (gid) {
    console.log('\n=== 20. 公会贡献排行 ===');
    res = await request(`/guild/${gid}/ranking`, auth);
    console.log('  排行条目数:', res.data?.length || 0);
    (res.data || []).slice(0, 3).forEach(r => {
      console.log(`    ${r.orgName}: ${r.amount} 贡献`);
    });
  }

  // 21. 任务执行记录奖励验证
  console.log('\n=== 21. 任务执行记录奖励验证 ===');
  res = await request('/missions/executions', auth);
  const executions = res.data;
  const isArray = Array.isArray(executions);
  console.log('  返回数据是数组:', isArray ? '✅ 是' : '❌ 否');
  if (isArray) {
    console.log('  执行记录数:', executions.length);
    const completedWithScrolls = executions.filter(e => e.result?.scrolls);
    if (completedWithScrolls.length > 0) {
      console.log('  含卷轴奖励的已完成任务数:', completedWithScrolls.length, '✅');
      completedWithScrolls.slice(0, 2).forEach(e => {
        console.log(`    - ${e.missionTitle || e.missionId}: 卷轴 ${e.result.scrolls.join(', ')}`);
      });
    } else {
      console.log('  暂无含卷轴奖励的已完成任务');
    }
  }

  console.log('\n🎉 全部测试完成！\n');
}

run().catch(e => {
  console.error('测试出错:', e.message);
  process.exit(1);
});
