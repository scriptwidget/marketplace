import json
import os


def main():
  result_widgets = []

  with open('marketplace.json') as file:
    data = json.load(file)
    print('current config:')
    print(data)

    size_mapper = {}
    for widget in data['widgets']:
      if widget['size'] == '':
        continue
      size_mapper[widget['name']] = widget['size']

    print('size mapper:')
    print(size_mapper)

    for dir in os.listdir('widgets'):
      if dir.startswith('.'):
        continue
      print(dir)

      name = dir
      size = 'small'
      if name in size_mapper:
        size = size_mapper[name]

      result_widgets.append({
        "name": name,
        "size": size,
      })

    print('output widgets:')
    print(result_widgets)


  output_data = {
    "name": "ScriptWidget Marketplace",
    "maintainer": "everettjf",
    "widgets": result_widgets
  }

  output_text = json.dumps(output_data, indent=4)
  with open('marketplace.json', 'w') as file:
    file.write(output_text)

  print('Done :)')


if __name__ == "__main__":
  main()