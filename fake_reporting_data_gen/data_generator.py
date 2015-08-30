import uuid
import datetime
import markov

date_format = '%m/%d/%Y %H:%M'
delimeter = ','
txtfile_ = open('jeeves.txt')

columns = [
	'taskID',
	'taskTitle',
	'taskPublishDate',
	'organizationID',
	'organizationName',
	'channel',
	'NCImageGUID',
	'ShutterstockImageID',
	'licensedDate',
]

organizations = (
	('5421c83c1a56de26e84bb012', 'Office Depot'),
	('52e1892183a64295640000d3', 'PNC (Deutsch)'),
	('53f208e41a56de26e84baf60', 'Monster UK',),
	('5522ff5041bd493f829c432c', 'Discover Student Loans'),
)

def create_guid():
	return uuid.uuid4().hex

def run():
	print delimeter.join(columns)
	
	now = datetime.datetime.utcnow()

	markov = markov.Markov(txtfile_)

	for index in xrange(0, 120):
		date = now - datetime.timedelta(days=index)
		row = (
				create_guid()[:24],
				markov.generate_markov_text(),
				date.strftime(date_format),
				organizations[index % 4][0],
				organizations[index % 4][1],
				'feed',
				create_guid(),
				create_guid()[:9],
				(date + datetime.timedelta(days=1)).strftime(date_format),
			)
		print delimeter.join(row)

if __name__ == '__main__':
	run()
