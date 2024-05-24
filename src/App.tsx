import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Slider, Dialog, DialogTitle, DialogContent, Card, CardMedia, CardContent } from '@mui/material';
import axios from 'axios';
import * as d3 from 'd3';
import { createRoot } from 'react-dom/client';

const App = () => {
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [selectedTemple, setSelectedTemple] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/temple?keyword=${keyword}&limit=${limit}`);
      console.log('Received data:', response.data); // デバッグ用
      response.data.forEach((item, index) => {
        console.log(`Item ${index}:`, item); // 各アイテムの構造を確認
      });
      const formattedData = formatData(response.data);
      setData(formattedData);
      drawGraph(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const formatData = (data) => {
    const nodes = [];
    const links = [];
    const centerNode = { id: keyword, group: 1, label: keyword }; // 中心ノード
    nodes.push(centerNode);

    data.forEach(d => {
      const templeNode = {
        id: d.temple.value,
        group: 2,
        label: d.label.value,
        description: d.description.value,
        thumbnail: d.thumbnail?.value // 画像のURLを追加
      };
      nodes.push(templeNode);
      links.push({ source: keyword, target: d.temple.value, label: 'is_related_to' });
    });

    return { nodes, links };
  };

  const drawGraph = (graph) => {
    // グラフ描画用のD3.jsロジック
    d3.select('#graph').selectAll('*').remove(); // 既存のグラフをクリア

    const width = 1200;  // 幅を広げる
    const height = 800; // 高さを広げる
    const svg = d3.select('#graph').append('svg')
      .attr('width', width)
      .attr('height', height);

    const simulation = d3.forceSimulation(graph.nodes)
      .force('link', d3.forceLink(graph.links).id(d => d.id).distance(200)) // ノード間の距離を広げる
      .force('charge', d3.forceManyBody().strength(-300)) // ノード間の引力/斥力を調整
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(graph.links)
      .enter().append('line')
      .attr('stroke-width', 2)
      .attr('stroke', '#999');

    const linkText = svg.append('g')
      .selectAll('text')
      .data(graph.links)
      .enter().append('text')
      .attr('font-size', '10px')
      .attr('fill', '#555')
      .attr('dy', -5) // ラベルの位置を調整
      .text(d => d.label);

    const node = svg.append('g')
      .selectAll('circle')
      .data(graph.nodes)
      .enter().append('circle')
      .attr('r', d => d.group === 1 ? 15 : 10) // 中心ノードを少し大きく
      .attr('fill', d => d.group === 1 ? 'red' : 'orange') // 中心ノードを赤色に
      .on('click', (event, d) => setSelectedTemple(d));

    const text = svg.append('g')
      .selectAll('text')
      .data(graph.nodes)
      .enter().append('text')
      .attr('x', 12) // テキストのx座標を調整
      .attr('y', 5) // テキストのy座標を調整
      .attr('font-size', '12px') // フォントサイズを調整
      .text(d => d.label);

    node.append('title')
      .text(d => d.label);

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      linkText
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      text
        .attr('x', d => d.x + 12) // テキストのx座標を調整
        .attr('y', d => d.y + 5); // テキストのy座標を調整
    });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Temple Graph</Typography>
      <TextField
        label="キーワード"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Typography id="limit-slider" gutterBottom>
        検索件数: {limit}
      </Typography>
      <Slider
        value={limit}
        onChange={(e, newValue) => setLimit(newValue)}
        aria-labelledby="limit-slider"
        valueLabelDisplay="auto"
        step={1}
        marks
        min={1}
        max={20}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSearch}
      >
        検索
      </Button>
      <div id="graph"></div>
      <Dialog open={Boolean(selectedTemple)} onClose={() => setSelectedTemple(null)}>
        <DialogTitle>{selectedTemple?.label}</DialogTitle>
        <DialogContent>
          {selectedTemple?.thumbnail && (
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={selectedTemple.thumbnail}
                alt={selectedTemple.label}
              />
            </Card>
          )}
          <Typography>{selectedTemple?.description}</Typography>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default App;
